import Link from 'next/link';
import {
  MessageSquare,
  ShieldCheck,
  Zap,
  UserX,
  ArrowRight,
  CheckCircle2,
  Lock,
  Globe2,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';
import OnlineBadge from '@/components/OnlineBadge';
import InteractiveParticleBackground from '@/components/InteractiveParticleBackground';

export default function HomePage() {
  const faqs = [
    {
      q: 'How does StrangerSpace random chat work?',
      a: 'StrangerSpace pairs you with a completely random stranger in a private 1-on-1 text conversation. Once you click "Start Chatting" and accept the adult eligibility check, our server matches you with another available user in the queue without revealing any identity or personal details.',
    },
    {
      q: 'Is StrangerSpace really free with no registration?',
      a: 'Yes. StrangerSpace is 100% free to use. You never need to enter an email, phone number, password, or create a public profile. A private guest token is automatically established to protect your session.',
    },
    {
      q: 'Are my chat messages saved or recorded?',
      a: 'No. StrangerSpace enforces a strict zero-retention policy. When either participant clicks "Skip", "Leave", or closes their window, all messages in that session are permanently purged from the database. In active conversations, older messages are pruned after 5 minutes.',
    },
    {
      q: 'How is StrangerSpace different from old Omegle or other chat sites?',
      a: 'Unlike legacy platforms that had unmoderated webcam rooms and bot spam, StrangerSpace is focused entirely on clean, responsive, text-only communication. We eliminate webcam risks, file sharing exploits, and fake bots.',
    },
    {
      q: 'What should I do if someone is rude or violates community guidelines?',
      a: 'You can immediately click the "Block" button to permanently prevent that user from ever being matched with you again, or click "Report" to flag their behavior to our moderation queue. You can also press "Skip" at any time to instantly meet a new stranger.',
    },
  ];

  return (
    <>
      {/* Interactive Physics Dot Canvas - Fixed to Viewport */}
      <InteractiveParticleBackground />

      <div className="flex flex-col items-center relative w-full max-w-full overflow-x-clip">
        {/* Ambient background aurora effects spanning entire page length */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden w-full max-w-full" aria-hidden="true">
          <div className="absolute -top-44 left-1/2 -translate-x-1/2 w-[780px] h-[380px] bg-indigo-600/15 rounded-full blur-[150px] animate-ambient-glow" />
          <div className="absolute top-[550px] -right-32 w-[600px] h-[450px] bg-cyan-600/10 rounded-full blur-[140px]" />
          <div className="absolute top-[950px] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-600/10 rounded-full blur-[150px]" />
          <div className="absolute top-[1500px] -left-32 w-[600px] h-[450px] bg-purple-600/10 rounded-full blur-[140px]" />
          <div className="absolute top-[2100px] -right-32 w-[550px] h-[450px] bg-cyan-600/10 rounded-full blur-[140px]" />
        </div>

        {/* Hero Section */}
        <section
          style={{ backgroundColor: 'transparent' }}
          className="relative w-full px-4 pt-20 pb-24 sm:px-6 lg:px-8 text-center"
        >
          <div className="mx-auto max-w-4xl relative z-10">
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-8">
              <OnlineBadge variant="hero" />

              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300 backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.12)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Adult-Only Pilot &bull; 18+ Only &bull; 100% Free
              </div>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.15]">
              Free Random Chat with Strangers.{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent drop-shadow-sm">
                No Login Required.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
              Connect instantly with someone new across the globe. StrangerSpace provides fast, private, 1-on-1 text conversations with random strangers — no apps, no phone numbers, and zero chat logs.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/chat"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <span>Start Random Chat Now</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-md px-7 py-4 text-base font-medium text-zinc-300 hover:bg-white/[0.08] hover:text-white hover:border-white/20 transition-all"
              >
                How Random Chat Works
              </a>
            </div>

            <div className="mt-6 text-xs text-zinc-500 flex items-center justify-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>By entering you confirm you are at least 18 years of age and agree to our guidelines.</span>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          style={{ backgroundColor: 'transparent' }}
          className="w-full border-t border-white/[0.08] bg-transparent py-24 px-4 sm:px-6 lg:px-8 relative z-10"
        >
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 mb-3">
              Step-by-Step Flow
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              How to Talk to Strangers on StrangerSpace
            </h2>
            <p className="mt-2 text-sm text-zinc-400 max-w-lg mx-auto">
              Direct, anonymous matchmaking engineered for instant conversation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="flex flex-col items-center text-center p-8 rounded-2xl glass-card">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-6 font-bold text-xl shadow-inner">
                1
              </div>
              <h3 className="text-lg font-semibold text-white">1. Join Without an Account</h3>
              <p className="mt-2.5 text-sm text-zinc-400 leading-relaxed">
                Confirm your age eligibility. You are assigned an ephemeral guest session without giving your name, email, or social accounts.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-8 rounded-2xl glass-card">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-6 font-bold text-xl shadow-inner">
                2
              </div>
              <h3 className="text-lg font-semibold text-white">2. Instant Random Matching</h3>
              <p className="mt-2.5 text-sm text-zinc-400 leading-relaxed">
                Hit "Find a Stranger". Our transactional queue pairs you with another live, available stranger in under a second.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-8 rounded-2xl glass-card">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-6 font-bold text-xl shadow-inner">
                3
              </div>
              <h3 className="text-lg font-semibold text-white">3. Real-Time Text Messaging</h3>
              <p className="mt-2.5 text-sm text-zinc-400 leading-relaxed">
                Chat in real time with typing indicators and pop alerts. Skip anytime to connect with someone else or leave with one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Deep-Dive Content: Why StrangerSpace */}
      <section className="w-full py-24 px-4 sm:px-6 lg:px-8 border-t border-white/[0.08] bg-transparent relative z-10">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 mb-3">
              Privacy First Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              The Modern, Safe Way to Chat with Strangers Online
            </h2>
            <p className="mt-2 text-sm text-zinc-400 max-w-lg mx-auto">
              Why thousands of people are switching to clean text-based random chat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-7 rounded-2xl glass-card">
              <div className="flex items-center gap-3.5 mb-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-white">100% Anonymous & Private</h3>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                You never reveal your identity, photo, or phone number. Both participants simply see "Stranger" and "You", keeping conversations focused and risk-free.
              </p>
            </div>

            <div className="p-7 rounded-2xl glass-card">
              <div className="flex items-center gap-3.5 mb-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-white">Zero Message Retention</h3>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Unlike social media platforms that log and mine your data, StrangerSpace purges all messages immediately when a conversation ends.
              </p>
            </div>

            <div className="p-7 rounded-2xl glass-card">
              <div className="flex items-center gap-3.5 mb-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-white">One-Click Block & Report</h3>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Encountering spam or disruptive behavior? One click permanently blocks the user so you are never matched again, and notifies our moderation team.
              </p>
            </div>

            <div className="p-7 rounded-2xl glass-card">
              <div className="flex items-center gap-3.5 mb-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Globe2 className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-white">No Webcam or Audio Vulnerabilities</h3>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                By focusing purely on text, you are protected from explicit camera streams, unwanted screenshots, and bandwidth throttling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* High-Intent FAQ Section (Rich Snippets for Google) */}
      <section id="faq" className="w-full py-24 px-4 sm:px-6 lg:px-8 border-t border-white/[0.08] bg-transparent relative z-10">
        <div className="mx-auto max-w-4xl relative z-10">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-3 shadow-inner">
              <HelpCircle className="h-6 w-6" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Frequently Asked Questions About Random Chat
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              Everything you need to know about chatting with strangers safely.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl glass-card p-6"
              >
                <h3 className="text-base font-semibold text-white mb-2 flex items-start gap-2.5">
                  <span className="text-indigo-400 font-mono text-sm mt-0.5">Q.</span>
                  <span>{faq.q}</span>
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-9 py-4 font-semibold text-white shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <span>Start Talking to Strangers</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  </>
  );
}
