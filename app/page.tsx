import Link from 'next/link';
import { MessageSquare, ShieldCheck, Zap, UserX, ArrowRight, CheckCircle2 } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

export default function HomePage() {
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
            Adult-Only Pilot &bull; 18+ Only
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
            Meet Someone New.{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-300 bg-clip-text text-transparent">
              Start a Conversation.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-gray-400 leading-relaxed">
            Instant, private text conversations with random strangers. No public profiles, no personal photos, no clutter. Just two people exchanging words in real time.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/chat"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-cyan-500 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              Start Chatting
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-900/60 px-7 py-3.5 text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              How It Works
            </a>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            By entering you confirm you are at least 18 years of age and agree to our rules.
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="w-full border-t border-gray-800/60 bg-[#0E1322] py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Three Simple Steps
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              No account setup hurdles or public profile creation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-gray-800 bg-gray-900/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 mb-5 font-bold text-lg">
                1
              </div>
              <h3 className="text-lg font-semibold text-white">Join</h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                Confirm your age and agree to the community rules. You receive a private guest session without submitting phone numbers or social profiles.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-gray-800 bg-gray-900/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 mb-5 font-bold text-lg">
                2
              </div>
              <h3 className="text-lg font-semibold text-white">Match</h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                Click Find Stranger. Our fair queue engine matches you with another available, eligible user who has not been blocked.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-gray-800 bg-gray-900/40">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 mb-5 font-bold text-lg">
                3
              </div>
              <h3 className="text-lg font-semibold text-white">Talk</h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">
                Chat in real time with text. Skip anytime to find someone else, leave quietly, or block and report disruptive users instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Design Principles */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Built with Safety & Privacy First
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Honest commitments without deceptive metrics or fake online counters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4 p-6 rounded-xl border border-gray-800 bg-gray-900/20">
              <ShieldCheck className="h-6 w-6 flex-shrink-0 text-indigo-400 mt-1" />
              <div>
                <h4 className="font-semibold text-white text-base">Enforceable Block & Report</h4>
                <p className="mt-1 text-sm text-gray-400 leading-relaxed">
                  Blocking prevents either user from being paired with the other again in future matchmaking. Reports are sent to the moderator queue.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-xl border border-gray-800 bg-gray-900/20">
              <UserX className="h-6 w-6 flex-shrink-0 text-cyan-400 mt-1" />
              <div>
                <h4 className="font-semibold text-white text-base">Zero Public Identity</h4>
                <p className="mt-1 text-sm text-gray-400 leading-relaxed">
                  Your chat partner only ever sees "Stranger". Internal authentication IDs and session tokens are strictly kept hidden.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-xl border border-gray-800 bg-gray-900/20">
              <Zap className="h-6 w-6 flex-shrink-0 text-amber-400 mt-1" />
              <div>
                <h4 className="font-semibold text-white text-base">Text-Only Focused</h4>
                <p className="mt-1 text-sm text-gray-400 leading-relaxed">
                  No video streams, voice calls, or file uploads. Reducing exposure surface minimizes spam, malicious media, and unwanted content.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 rounded-xl border border-gray-800 bg-gray-900/20">
              <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-emerald-400 mt-1" />
              <div>
                <h4 className="font-semibold text-white text-base">Bounded Message Retention</h4>
                <p className="mt-1 text-sm text-gray-400 leading-relaxed">
                  Conversations exist for live interaction. Messages are bounded and access is restricted only to verified participants.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
            >
              Enter StrangerSpace Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
