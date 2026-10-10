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
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden px-4 pt-16 pb-20 sm:px-6 lg:px-8 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-medium text-indigo-300 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Adult-Only Pilot &bull; 18+ Only &bull; 100% Free
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Free Random Chat with Strangers.{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-300 bg-clip-text text-transparent">
              No Login Required.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-gray-400 leading-relaxed">
            Connect instantly with someone new across the globe. StrangerSpace provides fast, private, 1-on-1 text conversations with random strangers — no apps, no phone numbers, and zero chat logs.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/chat"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-cyan-500 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              Start Random Chat Now
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-900/60 px-7 py-3.5 text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              How Random Chat Works
            </a>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            By entering you confirm you are at least 18 years of age and agree to our guidelines.
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="w-full border-t border-gray-800/60 bg-[#0E1322] py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              How to Talk to Strangers on StrangerSpace
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Direct, anonymous matchmaking engineered for instant conversation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-gray-800 bg-gray-900/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 mb-5 font-bold text-lg">
                1
              </div>
              <h3 className="text-lg font-semibold text-white">1. Join Without an Account</h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                Confirm your age eligibility. You are assigned an ephemeral guest session without giving your name, email, or social accounts.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-gray-800 bg-gray-900/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 mb-5 font-bold text-lg">
                2
              </div>
              <h3 className="text-lg font-semibold text-white">2. Instant Random Matching</h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                Hit "Find a Stranger". Our transactional queue pairs you with another live, available stranger in under a second.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-gray-800 bg-gray-900/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 mb-5 font-bold text-lg">
                3
              </div>
              <h3 className="text-lg font-semibold text-white">3. Real-Time Text Messaging</h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                Chat in real time with typing indicators and pop alerts. Skip anytime to connect with someone else or leave with one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Deep-Dive Content: Why StrangerSpace */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 border-t border-gray-800/40 bg-[#0B0F19]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              The Modern, Safe Way to Chat with Strangers Online
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Why thousands of people are switching to clean text-based random chat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/20">
              <div className="flex items-center gap-3 mb-3">
                <Lock className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-semibold text-white">100% Anonymous & Private</h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                You never reveal your identity, photo, or phone number. Both participants simply see "Stranger" and "You", keeping conversations focused and risk-free.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/20">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="h-5 w-5 text-cyan-400" />
                <h3 className="text-base font-semibold text-white">Zero Message Retention</h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Unlike social media platforms that log and mine your data, StrangerSpace purges all messages immediately when a conversation ends.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/20">
              <div className="flex items-center gap-3 mb-3">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-semibold text-white">One-Click Block & Report</h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Encountering spam or disruptive behavior? One click permanently blocks the user so you are never matched again, and notifies our moderation team.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-800 bg-gray-900/20">
              <div className="flex items-center gap-3 mb-3">
                <Globe2 className="h-5 w-5 text-purple-400" />
                <h3 className="text-base font-semibold text-white">No Webcam or Audio Vulnerabilities</h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                By focusing purely on text, you are protected from explicit camera streams, unwanted screenshots, and bandwidth throttling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* High-Intent FAQ Section (Rich Snippets for Google) */}
      <section id="faq" className="w-full py-20 px-4 sm:px-6 lg:px-8 border-t border-gray-800/60 bg-[#0E1322]">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 p-2 rounded-xl bg-indigo-500/10 text-indigo-400 mb-3">
              <HelpCircle className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Frequently Asked Questions About Random Chat
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Everything you need to know about chatting with strangers safely.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-gray-800 bg-gray-900/40 p-6 transition-colors hover:border-gray-700"
              >
                <h3 className="text-base font-semibold text-white mb-2">
                  {faq.q}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
            >
              Start Talking to Strangers
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
