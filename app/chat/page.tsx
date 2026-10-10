'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { APP_CONFIG, REPORT_REASONS } from '@/lib/constants';
import { formatTime, sanitizeText } from '@/lib/utils';
import {
  Send,
  UserX,
  Flag,
  RefreshCw,
  Shield,
  AlertTriangle,
  XCircle,
  LogOut,
  Check,
  Volume2,
  VolumeX,
  FastForward,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Lock
} from 'lucide-react';

type ChatState = 'idle' | 'connecting' | 'waiting' | 'matched' | 'connected' | 'ending' | 'ended' | 'error';

interface MessageItem {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

// Global audio context singleton with auto-resume for browser autoplay policies
let globalAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!globalAudioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      globalAudioCtx = new AudioContextClass();
    }
  }
  if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume().catch(() => {});
  }
  return globalAudioCtx;
}

function playSound(type: 'match' | 'message', isMuted: boolean) {
  if (isMuted || typeof window === 'undefined') return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'match') {
      // Bright chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.15); // C6
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } else {
      // Distinct crisp pop on message arrival
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
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
  const [mobileHeight, setMobileHeight] = useState<number | null>(null);

  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
    // Lock body scrolling when on /chat to ensure top bar stays fixed at all times
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Dynamically lock mobile container to visualViewport when virtual keyboard opens/closes
  // Desktop PC (>= 640px) is 100% unaffected and remains untouched
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleViewportChange = () => {
      if (window.innerWidth < 640) {
        if (window.visualViewport) {
          setMobileHeight(window.visualViewport.height);
          // If browser attempted to scroll the window when keyboard appeared, snap back to 0
          if (window.scrollY !== 0) {
            window.scrollTo(0, 0);
          }
        }
      } else {
        setMobileHeight(null);
      }
    };

    handleViewportChange();

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);
    }
    window.addEventListener('resize', handleViewportChange);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
        window.visualViewport.removeEventListener('scroll', handleViewportChange);
      }
      window.removeEventListener('resize', handleViewportChange);
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
            return prev;
          }
          // If new message from stranger arrived, play pop
          if (data.length > prev.length && prev.length > 0) {
            const latest = data[data.length - 1];
            if (currentUser && latest.sender_id !== currentUser.id) {
              playSound('message', isMuted);
              setPartnerIsTyping(false);
            }
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
        setChatState('connected');
        playSound('match', isMuted);
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
          setChatState('connected');
          playSound('match', isMuted);
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
    // Keep input focused so mobile virtual keyboard stays open after sending
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

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
    <div
      style={
        mobileHeight
          ? {
              height: `${mobileHeight}px`,
              maxHeight: `${mobileHeight}px`,
              top: 0,
              bottom: 'auto'
            }
          : undefined
      }
      className="fixed inset-0 top-0 sm:top-16 flex flex-col bg-[#080C16] text-gray-100 overflow-hidden overscroll-none select-none"
    >
      {/* Subtle ambient luxury backdrop glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[320px] bg-indigo-600/10 rounded-full blur-[140px] opacity-70" />
      <div className="pointer-events-none absolute bottom-0 right-10 w-[400px] h-[250px] bg-cyan-600/5 rounded-full blur-[120px] opacity-60" />

      {/* Main Responsive Chat Layout Panel */}
      <div className="flex-1 flex flex-col mx-auto w-full max-w-4xl lg:max-w-5xl sm:px-6 sm:py-3.5 min-h-0 overflow-hidden relative">
        <div className="flex-1 flex flex-col min-h-0 sm:rounded-2xl sm:border sm:border-white/[0.08] sm:bg-[#0D1220]/80 sm:backdrop-blur-xl sm:shadow-2xl overflow-hidden relative">

          {/* PERMANENT TOP CHAT TOOLBAR */}
          <header className="flex-shrink-0 flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 border-b border-white/[0.08] bg-[#090D18]/95 backdrop-blur-md z-30 gap-2">
            {/* Left: Brand Identity & Live Status */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-bold text-sm sm:text-base tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent truncate">
                  StrangerSpace
                </span>
                {chatState === 'connected' && (
                  <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="hidden sm:inline">Connected</span>
                    <span className="sm:hidden">Online</span>
                  </span>
                )}
                {chatState === 'waiting' && (
                  <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
                    <RefreshCw className="h-3 w-3 animate-spin text-cyan-400" />
                    <span className="hidden sm:inline">Finding a Stranger...</span>
                    <span className="sm:hidden">Finding...</span>
                  </span>
                )}
                {chatState === 'connecting' && (
                  <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                    <RefreshCw className="h-3 w-3 animate-spin text-indigo-400" />
                    <span>Connecting...</span>
                  </span>
                )}
              </div>
            </div>

            {/* Right: Distinct Toolbar Action Buttons */}
            {chatState === 'connected' && (
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                {/* Sound Mute Toggle */}
                <button
                  onClick={() => {
                    setIsMuted((prev) => {
                      const nextState = !prev;
                      if (!nextState) playSound('message', false);
                      return nextState;
                    });
                  }}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-all active:scale-95"
                  title={isMuted ? 'Unmute notification sounds' : 'Mute notification sounds'}
                >
                  {isMuted ? (
                    <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-500" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-cyan-400" />
                  )}
                </button>

                {/* SKIP BUTTON - High-contrast metallic/action style */}
                <button
                  onClick={handleSkip}
                  className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-zinc-800 to-zinc-700 hover:from-zinc-700 hover:to-zinc-600 border border-white/10 hover:border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all flex-shrink-0"
                  title="Skip to next stranger"
                >
                  <FastForward className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Skip</span>
                </button>

                {/* BLOCK BUTTON - Amber Safety Action (Requires Confirmation) */}
                <button
                  onClick={() => setShowBlockModal(true)}
                  className="px-2 sm:px-3 py-1.5 rounded-xl border border-amber-500/25 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm flex-shrink-0"
                  title="Block Stranger"
                >
                  <UserX className="h-3.5 w-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Block</span>
                </button>

                {/* LEAVE BUTTON - Refined Rose Danger Style */}
                <button
                  onClick={handleLeave}
                  className="px-2.5 sm:px-3.5 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all shadow-sm flex-shrink-0"
                  title="Leave chat session"
                >
                  <LogOut className="h-3.5 w-3.5 text-rose-400" />
                  <span>Leave</span>
                </button>

                {/* REPORT BUTTON - Discreet Flag */}
                <button
                  onClick={() => setShowReportModal(true)}
                  className="p-1.5 sm:p-2 rounded-xl border border-white/5 bg-white/[0.03] hover:border-rose-500/20 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 transition-colors active:scale-95"
                  title="Report Stranger for violation"
                >
                  <Flag className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </header>

          {/* Error Banner if any */}
          {errorMsg && (
            <div className="mx-3 my-2 p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300 flex items-center justify-between flex-shrink-0">
              <span className="truncate pr-2">{errorMsg}</span>
              <button onClick={() => setErrorMsg('')} className="p-1 hover:text-white transition-colors">
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* MAIN CONVERSATION / STATE BODY */}
          <div className="flex-1 flex flex-col min-h-0 bg-[#0A0E1A]/60 overflow-hidden relative">

            {/* IDLE STATE */}
            {chatState === 'idle' && (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
                <div className="relative mb-5">
                  <div className="absolute inset-0 rounded-2xl bg-indigo-500/20 blur-xl" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/10 border border-white/10 text-indigo-400 shadow-xl">
                    <MessageSquare className="h-8 w-8" />
                  </div>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Ready to Meet Someone New?
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-sm leading-relaxed">
                  Start an instant, randomized 1-on-1 text conversation. Zero logs, anonymous, and encrypted.
                </p>
                <button
                  onClick={handleStartSearch}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:brightness-110 active:scale-95 transition-all"
                >
                  <span>Find a Stranger</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-emerald-400" /> 18+ Adults Pilot
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Lock className="h-3 w-3 text-cyan-400" /> Ephemeral Messages
                  </span>
                </div>
              </div>
            )}

            {/* CONNECTING STATE */}
            {chatState === 'connecting' && (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4">
                  <RefreshCw className="h-8 w-8 animate-spin text-indigo-400" />
                </div>
                <h3 className="text-base font-semibold text-white">Contacting Matchmaker...</h3>
                <p className="mt-1 text-xs text-zinc-400">Securing a randomized private session.</p>
              </div>
            )}

            {/* WAITING IN QUEUE STATE */}
            {chatState === 'waiting' && (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-5">
                  <div className="absolute inset-0 rounded-full border border-cyan-400/30 animate-ping [animation-duration:2.5s]" />
                  <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
                </div>
                <h2 className="text-lg font-bold text-white">Searching for an available stranger...</h2>
                <p className="mt-1 text-xs text-zinc-400 max-w-xs leading-relaxed">
                  You will connect automatically as soon as another adult user joins.
                </p>
                <button
                  onClick={handleCancelSearch}
                  className="mt-6 px-5 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-zinc-300 hover:text-white transition-all active:scale-95"
                >
                  Cancel Search
                </button>
              </div>
            )}

            {/* ACTIVE CONNECTED CONVERSATION - INDEPENDENTLY SCROLLABLE */}
            {chatState === 'connected' && (
              <div
                ref={chatContainerRef}
                className="flex-1 flex flex-col p-3.5 sm:p-5 overflow-y-auto overscroll-contain min-h-0 space-y-3.5 select-text"
              >
                {/* Welcome Encryption Notice */}
                <div className="mx-auto max-w-sm rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-zinc-300">
                    <Shield className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Encrypted & Anonymous Session</span>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-400 leading-normal">
                    Say hello! Be respectful. Messages vanish permanently when the chat ends.
                  </p>
                </div>

                {messages.length === 0 && (
                  <div className="flex-1 flex items-center justify-center text-xs text-zinc-400 py-10">
                    No messages yet. Send the first message below.
                  </div>
                )}

                {/* Message Bubbles */}
                {messages.map((msg) => {
                  const isMine = currentUser && msg.sender_id === currentUser.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div className="text-[10px] text-zinc-400 mb-1 px-1 font-mono tracking-tight">
                        {isMine ? 'You' : 'Stranger'} &bull; {formatTime(msg.created_at)}
                      </div>
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed break-words max-w-[85%] sm:max-w-md ${
                          isMine
                            ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-sm shadow-md shadow-indigo-950/30'
                            : 'bg-[#161D31]/95 border border-white/[0.08] text-zinc-100 rounded-tl-sm shadow-sm'
                        }`}
                      >
                        {msg.body}
                      </div>
                    </div>
                  );
                })}

                {/* Partner Typing Indicator */}
                {partnerIsTyping && (
                  <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#161D31]/80 px-3 py-1.5 w-fit text-xs text-zinc-400 shadow-sm animate-pulse">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    <span className="text-[11px] font-medium text-zinc-300">Stranger is typing</span>
                    <span className="flex items-center gap-0.5 ml-0.5">
                      <span className="h-1 w-1 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                      <span className="h-1 w-1 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
                      <span className="h-1 w-1 rounded-full bg-cyan-400 animate-bounce" />
                    </span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* ENDED STATE */}
            {chatState === 'ended' && (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800/80 border border-white/10 text-zinc-400 mb-4 shadow-inner">
                  <LogOut className="h-7 w-7" />
                </div>
                <h2 className="text-lg font-bold text-white">Conversation Ended</h2>
                <p className="mt-1 text-xs text-zinc-400 max-w-sm">
                  {endReasonNotice || 'Stranger has disconnected or left the chat.'}
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={handleStartSearch}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/25 active:scale-95 transition-all"
                  >
                    Find New Stranger
                  </button>
                  <button
                    onClick={() => setChatState('idle')}
                    className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-zinc-300 hover:text-white transition-all active:scale-95"
                  >
                    Return Home
                  </button>
                </div>
              </div>
            )}

            {/* PERMANENT PINNED MESSAGE COMPOSER */}
            {chatState === 'connected' && (
              <form
                onSubmit={handleSendMessage}
                className="flex-shrink-0 border-t border-white/[0.08] bg-[#090D18]/95 backdrop-blur-md p-2.5 sm:p-3.5 flex items-center gap-2 sm:gap-3"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={handleInputChange}
                  placeholder="Type your message... (Enter to send)"
                  maxLength={APP_CONFIG.maxMessageLength}
                  className="flex-1 min-w-0 rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.06] px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 transition-all"
                  autoFocus
                />
                <button
                  type="submit"
                  onMouseDown={(e) => {
                    // Prevent input from losing focus when clicking Send
                    e.preventDefault();
                  }}
                  className={`flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white shadow-lg shadow-indigo-600/25 transition-all flex-shrink-0 ${
                    !inputMessage.trim() ? 'opacity-30 cursor-not-allowed' : ''
                  }`}
                  title="Send Message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* AGE & TERMS GATE CONFIRMATION MODAL */}
      {showAgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0F1424] p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Age & Rules Confirmation</h3>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              StrangerSpace is strictly an adult-only platform pilot for users aged 18 and older.
            </p>
            <ul className="mt-3.5 space-y-2 text-xs text-zinc-400 list-disc list-inside">
              <li>You confirm you are at least 18 years of age.</li>
              <li>You agree to our Community Guidelines and Terms of Use.</li>
              <li>You will not solicit, harass, scam, or share abusive content.</li>
            </ul>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAgeModal(false)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAgeGate}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 active:scale-95 shadow-md shadow-indigo-600/30 transition-all"
              >
                I am 18+ and Agree
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BLOCK CONFIRMATION MODAL */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl border border-amber-500/20 bg-[#0F1424] p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Block Stranger?</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-6">
              Blocking will immediately end this chat session and permanently prevent both of you from ever being matched together again.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowBlockModal(false)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBlock}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-white active:scale-95 transition-all shadow-md shadow-amber-600/25"
              >
                Confirm Block
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/20 bg-[#0F1424] p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <Flag className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Report Violation</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Select the violation reason. Submitting immediately ends the chat and queues the session for moderator review.
            </p>

            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Reason:</label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0A0E1A] px-3 py-2 text-xs text-white mb-3 focus:outline-none focus:border-indigo-500"
            >
              {REPORT_REASONS.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.label}
                </option>
              ))}
            </select>

            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Optional Notes:</label>
            <textarea
              value={reportNotes}
              onChange={(e) => setReportNotes(e.target.value)}
              rows={3}
              placeholder="Provide context for moderation..."
              className="w-full rounded-xl border border-white/10 bg-[#0A0E1A] p-3 text-xs text-white placeholder-zinc-400 mb-4 focus:outline-none focus:border-indigo-500"
            />

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReport}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white active:scale-95 transition-all shadow-md shadow-rose-600/25"
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
