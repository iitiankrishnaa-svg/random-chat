import { APP_CONFIG } from '@/lib/constants';

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-semibold mb-8">
        LEGAL DRAFT NOTICE: This privacy policy is a development draft for pilot operations. It must be customized and reviewed by legal counsel before public launch.
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Privacy Policy (Draft)</h1>
      <p className="text-xs text-gray-500 mb-8">Last Updated: October 2026 &bull; Version {APP_CONFIG.policies.privacyVersion}</p>

      <div className="space-y-6 text-sm text-gray-300 leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-white mb-2">1. Data Minimization</h2>
          <p>
            We adhere to strict data minimization. We do not require or collect public profiles, names, email addresses, phone numbers, or avatar photos for guest chatting.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">2. Information Collected</h2>
          <p>
            - Anonymous Authenticated ID: A randomly generated UUID session token maintained by Supabase Auth to enable session integrity, block persistence, and rate-limiting enforcement.
            <br />
            - Policy Acceptance Records: Timestamp of when rules were accepted.
            <br />
            - Safety Reports: Reports submitted by users (including reason code and optional notes).
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">3. Message Retention Policy</h2>
          <p>
            Messages exist primarily for active live conversation. Database Row Level Security (RLS) restricts message access exclusively to current session participants. We do not retain messages indefinitely.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">4. Disclaimers Regarding Anonymity</h2>
          <p>
            We do not claim that the service is "impossible to trace" or end-to-end encrypted. Like all web services, standard internet routing and legal compliance procedures apply.
          </p>
        </section>
      </div>
    </div>
  );
}
