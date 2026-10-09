'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { APP_CONFIG, REPORT_REASONS } from '@/lib/constants';
import { formatTime, sanitizeText } from '@/lib/utils';
import {
  Send, UserX, Flag, RefreshCw, Shield, AlertTriangle, XCircle, LogOut, Check, Volume2, VolumeX
} from 'lucide-react';

type ChatState = 'idle' | 'connecting' | 'waiting' | 'matched' | 'connected' | 'ending' | 'ended' | 'error';

interface MessageItem {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

// Zero-asset Web Audio synth for crisp subtle pops
function playSound(type: 'match' | 'message', isMuted: boolean) {
  if (isMuted || typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'match') {
      // Pleasant dual chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.28);
    } else {
      // Subtle pop on incoming message
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.14);
    }
  } catch {}
}

export default function ChatPage() {
  const [chatState, setChatState] = useState<ChatState>('idle');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [hasAgreedToRules, setHasAgreedToRules] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [reportReason, setReportReason] = useState('inappropriate');
  const [reportNotes, setReportNotes] = useState('');
  const [endReasonNotice, setEndReasonNotice] = useState<string | null>(null);
  const [partnerIsTyping, setPartnerIsTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const supabase = createClient();
  const typingChannelRef = useRef<any>(null);
  const typingTimerRef = useRef<any>(null);
  const lastTypingSentRef = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<any>(null);
  const activeSessionRef = useRef<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const prevMsgCountRef = useRef<number>(0);

  // Auto scroll the inner chat container only (preventing page window from jumping)
  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      // Smoothly scroll the inner messages container to bottom without scrolling the whole webpage
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
    prevMsgCountRef.current = messages.length;
  }, [messages]);

  // Auth setup on mount
  useEffect(() => {
    initAuth();
    return () => {
      cleanupQueuePoll();
    };
  }, []);

  const initAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        await checkProfile(user.id);
      } else {
        // Attempt anonymous sign in
        const { data, error } = await supabase.auth.signInAnonymously();
        if (data?.user) {
          setCurrentUser(data.user);
          await checkProfile(data.user.id);
        } else if (error) {
          setErrorMsg(`Authentication error: ${error.message}. (Status: ${error.status || 'unknown'})`);
        }
      }
    } catch (e: any) {
      setErrorMsg('Failed to initialize session: ' + e.message);
    }
  };

  const checkProfile = async (userId: string) => {
    try {
      await supabase.rpc('ensure_user_profile');
      // Check if previously accepted terms
      const { data } = await supabase
        .from('policy_acceptances')
        .select('id')
        .eq('user_id', userId)
        .eq('policy_type', 'terms_and_age')
        .maybeSingle();

      if (data) {
        setHasAgreedToRules(true);
      }
    } catch {
      // Ignored for offline/placeholder mode
    }
  };

  // Clean up active session when user leaves page, clicks home/links, or closes tab
  useEffect(() => {
    activeSessionRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    const handleTerminate = () => {
      const activeId = activeSessionRef.current;
      if (activeId) {
        // Asynchronously end session
        supabase.rpc('end_session', { p_session_id: activeId, p_reason: 'left' }).then(() => {});
      }
    };

    window.addEventListener('beforeunload', handleTerminate);
    window.addEventListener('pagehide', handleTerminate);

    return () => {
      window.removeEventListener('beforeunload', handleTerminate);
      window.removeEventListener('pagehide', handleTerminate);
      handleTerminate();
    };
  }, []);

  // Realtime subscription for active chat session
  useEffect(() => {
    if (!sessionId) return;

    // Load messages for session only if changed
    const fetchSessionMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages((prev) => {
          if (prev.length === data.length && prev[prev.length - 1]?.id === data[data.length - 1]?.id) {
            return prev; // No changes, do NOT trigger state update or scroll
          }
          return data as MessageItem[];
        });
      }
    };
    fetchSessionMessages();

    // Subscribe to new messages
    const channel = supabase.channel(`session-${sessionId}`);
    typingChannelRef.current = channel;
    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          const newMsg = payload.new as MessageItem;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            // Play pop sound if sender is partner
            if (currentUser && newMsg.sender_id !== currentUser.id) {
              playSound('message', isMuted);
              setPartnerIsTyping(false);
            }
            return [...prev, newMsg];
          });
        }
      )
      .on('broadcast', { event: 'typing' }, (payload: any) => {
        if (currentUser && payload.payload?.sender_id !== currentUser.id) {
          setPartnerIsTyping(true);
          if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
          typingTimerRef.current = setTimeout(() => {
            setPartnerIsTyping(false);
          }, 2500);
        }
      })
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_sessions',
          filter: `id=eq.${sessionId}`
        },
        (payload: any) => {
          if (payload.new && payload.new.status === 'ended') {
            cleanupSessionAndSearchNext(payload.new.end_reason || 'Stranger left the conversation');
          }
        }
      )
      .subscribe();

    // Check if session has been ended by partner
    const checkSessionState = async () => {
      try {
        const { data } = await supabase
          .from('chat_sessions')
          .select('status, end_reason')
          .eq('id', sessionId)
          .maybeSingle();

        if (data && data.status === 'ended') {
          // Partner left or skipped! Instantly transition
          cleanupSessionAndSearchNext(data.end_reason || 'Stranger left the conversation');
        }
      } catch {}
    };

    // Backup polling every 1.2s for new messages and partner status
    const syncInterval = setInterval(() => {
      fetchSessionMessages();
      checkSessionState();
    }, 1200);

    return () => {
      clearInterval(syncInterval);
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const cleanupSessionAndSearchNext = (reason: string) => {
    setEndReasonNotice(reason);
    setSessionId(null);
    setMessages([]);
    // Automatically start searching for a new stranger
    handleStartSearch();
  };

  const cleanupQueuePoll = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const handleStartSearch = async () => {
    if (!hasAgreedToRules) {
      setShowAgeModal(true);
      return;
    }

    setErrorMsg('');
    setEndReasonNotice(null);
    setMessages([]);
    setSessionId(null);
    setChatState('connecting');

    try {
      const { data, error } = await supabase.rpc('find_match');

      if (error) {
        setErrorMsg(error.message);
        setChatState('error');
        return;
      }

      if (data && data.status === 'matched') {
        activeSessionRef.current = data.session_id;
        setSessionId(data.session_id);
        setChatState('connected'); playSound('match', isMuted);
      } else if (data && data.status === 'waiting') {
        setChatState('waiting');
        startQueuePolling();
      } else if (data && data.status === 'restricted') {
        setErrorMsg('Account restricted: ' + (data.reason || 'Not eligible'));
        setChatState('error');
      }
    } catch (e: any) {
      setErrorMsg('Failed to find match: ' + e.message);
      setChatState('error');
    }
  };

  const startQueuePolling = () => {
    cleanupQueuePoll();
    pollIntervalRef.current = setInterval(async () => {
      try {
        const { data } = await supabase.rpc('check_queue_status');
        if (data && data.status === 'matched' && data.session_id) {
          cleanupQueuePoll();
          activeSessionRef.current = data.session_id;
          setSessionId(data.session_id);
          setChatState('connected'); playSound('match', isMuted);
        }
      } catch {
        // Continue polling
      }
    }, 2000);
  };

  const handleCancelSearch = async () => {
    cleanupQueuePoll();
    try {
      await supabase.rpc('leave_queue');
    } catch {}
    setChatState('idle');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    const now = Date.now();
    if (typingChannelRef.current && currentUser && now - lastTypingSentRef.current > 1500) {
      lastTypingSentRef.current = now;
      typingChannelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { sender_id: currentUser.id }
      }).catch(() => {});
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !sessionId || chatState !== 'connected') return;

    const text = inputMessage.trim();
    if (text.length > APP_CONFIG.maxMessageLength) {
      setErrorMsg(`Message exceeds max limit of ${APP_CONFIG.maxMessageLength} characters`);
      return;
    }

    setInputMessage('');
    // Optimistic local preview
    if (currentUser) {
      const tempMsg: MessageItem = {
        id: 'temp-' + Date.now(),
        sender_id: currentUser.id,
        body: text,
        created_at: new Date().toISOString()
      };
      setMessages((prev) => [...prev, tempMsg]);
    }

    try {
      const { data, error } = await supabase.rpc('send_message', {
        p_session_id: sessionId,
        p_body: text
      });

      if (error) {
        setErrorMsg('Failed to send: ' + error.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send');
    }
  };

  const handleSkip = async () => {
    if (!sessionId) return;
    setChatState('ending');
    try {
      await supabase.rpc('end_session', { p_session_id: sessionId, p_reason: 'skipped' });
    } catch {}
    // Automatically search next stranger
    handleStartSearch();
  };

  const handleLeave = async () => {
    if (!sessionId) {
      setChatState('idle');
      return;
    }
    setChatState('ending');
    try {
      await supabase.rpc('end_session', { p_session_id: sessionId, p_reason: 'left' });
    } catch {}
    setSessionId(null);
    setMessages([]);
    setChatState('idle');
  };

  const handleConfirmBlock = async () => {
    if (!sessionId) return;
    try {
      await supabase.rpc('block_session_partner', { p_session_id: sessionId });
      setShowBlockModal(false);
      setChatState('ended');
      setEndReasonNotice('You blocked this user. You will not be matched together again.');
    } catch (e: any) {
      setErrorMsg('Block failed: ' + e.message);
    }
  };

  const handleConfirmReport = async () => {
    if (!sessionId) return;
    try {
      await supabase.rpc('report_session_partner', {
        p_session_id: sessionId,
        p_reason_code: reportReason,
        p_description: reportNotes || null
      });
      setShowReportModal(false);
      setChatState('ended');
      setEndReasonNotice('Report submitted. The session has ended.');
    } catch (e: any) {
      setErrorMsg('Report failed: ' + e.message);
    }
  };

  const handleConfirmAgeGate = async () => {
    try {
      await supabase.rpc('accept_policy', { p_policy_type: 'terms_and_age' });
      setHasAgreedToRules(true);
      setShowAgeModal(false);
      handleStartSearch();
    } catch (e: any) {
      setHasAgreedToRules(true);
      setShowAgeModal(false);
      handleStartSearch();
    }
  };

  return (
    <div className="flex flex-1 flex-col mx-auto w-full max-w-4xl px-4 py-3 sm:px-6 h-[calc(100vh-4.2rem)] max-h-[calc(100vh-4.2rem)] overflow-hidden">
      {/* Top Banner & Session Status */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span>StrangerSpace Chat</span>
            {chatState === 'connected' && (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Connected with Stranger
              </span>
            )}
            {chatState === 'waiting' && (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Finding a Stranger...
              </span>
            )}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            1-on-1 random text chat. No real names or contact details shared.
          </p>
        </div>

        {chatState === 'connected' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(prev => !prev)}
              className="px-2 py-1.5 rounded-lg border border-gray-800 hover:border-gray-700 text-xs text-gray-400 hover:text-white transition-colors"
              title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-gray-500" /> : <Volume2 className="h-4 w-4 text-cyan-400" />}
            </button>
            <button
              onClick={handleSkip}
              className="px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white transition-colors"
            >
              Skip
            </button>
            <button
              onClick={() => setShowBlockModal(true)}
              className="px-2.5 py-1.5 rounded-lg border border-gray-800 hover:border-gray-700 text-xs font-medium text-gray-400 hover:text-white transition-colors"
              title="Block Stranger"
            >
              <UserX className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowReportModal(true)}
              className="px-2.5 py-1.5 rounded-lg border border-gray-800 hover:border-rose-900/40 text-xs font-medium text-gray-400 hover:text-rose-400 transition-colors"
              title="Report Stranger"
            >
              <Flag className="h-4 w-4" />
            </button>
            <button
              onClick={handleLeave}
              className="px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold text-rose-300 transition-colors"
            >
              Leave
            </button>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')}><XCircle className="h-4 w-4" /></button>
        </div>
      )}

      {/* Main Conversation or Waiting Body */}
      <div className="flex-1 flex flex-col min-h-0 rounded-2xl border border-gray-800 bg-[#0E1322] overflow-hidden">
        {chatState === 'idle' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 mb-4 shadow-inner">
              <Shield className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Ready to Talk?</h2>
            <p className="mt-2 text-sm text-gray-400 max-w-sm">
              Press the button below to connect with another random stranger in real time.
            </p>
            <button
              onClick={handleStartSearch}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-cyan-500 transition-all"
            >
              Find a Stranger
            </button>
          </div>
        )}

        {chatState === 'connecting' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-indigo-400 mb-3" />
            <h3 className="text-base font-semibold text-white">Connecting to Matchmaker...</h3>
          </div>
        )}

        {chatState === 'waiting' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400 mb-4">
              <RefreshCw className="h-7 w-7 animate-spin" />
            </div>
            <h2 className="text-lg font-bold text-white">Waiting for an available stranger...</h2>
            <p className="mt-1 text-xs text-gray-400 max-w-xs">
              Matching happens automatically as soon as another eligible user joins.
            </p>
            <button
              onClick={handleCancelSearch}
              className="mt-6 px-5 py-2 rounded-xl border border-gray-700 bg-gray-800 text-xs font-semibold text-gray-300 hover:text-white"
            >
              Cancel Search
            </button>
          </div>
        )}

        {chatState === 'connected' && (
          <div ref={chatContainerRef} className="flex-1 flex flex-col p-4 overflow-y-auto min-h-0 space-y-3">
            <div className="text-center py-2 text-xs text-gray-500 border-b border-gray-800/60 mb-2">
              You are now chatting with Stranger. Say hello!
            </div>

            {messages.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-xs text-gray-600">
                No messages yet. Send the first message below.
              </div>
            )}

            {messages.map((msg) => {
              const isMine = currentUser && msg.sender_id === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div className="text-[10px] text-gray-500 mb-0.5 px-1">
                    {isMine ? 'You' : 'Stranger'} &bull; {formatTime(msg.created_at)}
                  </div>
                  <div
                    className={`max-w-md rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words ${
                      isMine
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/15'
                        : 'bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700/60'
                    }`}
                  >
                    {msg.body}
                  </div>
                </div>
              );
            })}
            {partnerIsTyping && (
              <div className="flex items-center gap-2 text-xs text-gray-400 px-1 py-1 animate-pulse">
                <span className="flex h-2 w-2 rounded-full bg-cyan-400"></span>
                <span>Stranger is typing</span>
                <span className="flex gap-1 items-center">
                  <span className="h-1 w-1 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="h-1 w-1 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="h-1 w-1 bg-gray-400 rounded-full animate-bounce"></span>
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {chatState === 'ended' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-800 text-gray-400 mb-4">
              <LogOut className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold text-white">Conversation Ended</h2>
            <p className="mt-1 text-xs text-gray-400">
              {endReasonNotice || 'Stranger has disconnected or left the chat.'}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handleStartSearch}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                Find New Stranger
              </button>
              <button
                onClick={() => setChatState('idle')}
                className="px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-800 text-sm font-medium text-gray-300 hover:text-white"
              >
                Return Home
              </button>
            </div>
          </div>
        )}

        {/* Input Bar */}
        {chatState === 'connected' && (
          <form
            onSubmit={handleSendMessage}
            className="border-t border-gray-800 bg-[#0B0F19] p-3 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={handleInputChange}
              placeholder="Type your message... (Enter to send)"
              maxLength={APP_CONFIG.maxMessageLength}
              className="flex-1 rounded-xl border border-gray-700 bg-gray-900/80 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>

      {/* Age & Terms Gate Modal */}
      {showAgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#0F1423] p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Age & Rules Confirmation</h3>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              StrangerSpace is strictly an adult-only platform pilot for users aged 18 and older.
            </p>
            <ul className="mt-3 space-y-2 text-xs text-gray-400 list-disc list-inside">
              <li>You confirm you are at least 18 years old.</li>
              <li>You agree to our Community Guidelines and Terms of Use.</li>
              <li>You will not solicit, harass, scam, or share abusive content.</li>
            </ul>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAgeModal(false)}
                className="px-4 py-2 rounded-xl border border-gray-700 text-xs font-semibold text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAgeGate}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                I am 18+ and Agree
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#0F1423] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Block Stranger?</h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-6">
              Blocking will immediately end this chat session and permanently prevent both of you from ever being matched again.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowBlockModal(false)}
                className="px-4 py-2 rounded-xl border border-gray-700 text-xs font-semibold text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBlock}
                className="px-5 py-2 rounded-xl bg-rose-600 text-xs font-semibold text-white hover:bg-rose-500"
              >
                Confirm Block
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#0F1423] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Report Violation</h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Select the violation reason. Submitting ends the chat and queues the session for administrator review.
            </p>

            <label className="block text-xs font-semibold text-gray-300 mb-1">Reason:</label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-xs text-white mb-3"
            >
              {REPORT_REASONS.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.label}
                </option>
              ))}
            </select>

            <label className="block text-xs font-semibold text-gray-300 mb-1">Optional Notes:</label>
            <textarea
              value={reportNotes}
              onChange={(e) => setReportNotes(e.target.value)}
              rows={3}
              placeholder="Provide context for moderation..."
              className="w-full rounded-xl border border-gray-700 bg-gray-900 p-3 text-xs text-white placeholder-gray-500 mb-4 focus:outline-none focus:border-indigo-500"
            />

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 rounded-xl border border-gray-700 text-xs font-semibold text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReport}
                className="px-5 py-2 rounded-xl bg-rose-600 text-xs font-semibold text-white hover:bg-rose-500"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
