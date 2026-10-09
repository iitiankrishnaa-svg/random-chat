import { APP_CONFIG } from '@/lib/constants';

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-semibold mb-8">
        LEGAL DRAFT NOTICE: This document is a preliminary draft template for pilot development purposes. It requires professional legal counsel review prior to public commercial deployment.
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Terms of Use (Draft)</h1>
      <p className="text-xs text-gray-500 mb-8">Last Updated: October 2026 &bull; Version {APP_CONFIG.policies.termsVersion}</p>

      <div className="space-y-6 text-sm text-gray-300 leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-white mb-2">1. Eligibility & Age Gate</h2>
          <p>
            You must be at least 18 years of age to access or use {APP_CONFIG.name}. By using this service, you affirm that you meet the age requirement. A self-declared age confirmation is collected upon entry; however, the service reserves the right to implement additional age assurance verification.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">2. Nature of the Service</h2>
          <p>
            {APP_CONFIG.name} provides an ephemeral text-matching connection between two unverified users. You acknowledge that communications are made with unknown strangers. You assume full personal responsibility for interactions.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">3. Moderation & Termination</h2>
          <p>
            We reserve the right to restrict, suspend, or terminate access for users who violate guidelines, abuse rate limits, or engage in disruptive behavior. Because this service is operated by an individual operator during pilot stages, 24/7 real-time moderation cannot be guaranteed.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">4. Disclaimers & Limitation of Liability</h2>
          <p>
            The service is provided on an "AS IS" and "AS AVAILABLE" basis without warranty of any kind. Under no circumstances shall {APP_CONFIG.name} be liable for any indirect, incidental, or consequential damages resulting from user communications.
          </p>
        </section>
      </div>
    </div>
  );
}
