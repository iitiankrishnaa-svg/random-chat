import Link from 'next/link';
import { Shield, AlertTriangle, EyeOff, Flag, Ban, Check } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

export default function SafetyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
          <Shield className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Safety Guidelines</h1>
          <p className="text-sm text-gray-400">Protecting your privacy and well-being on {APP_CONFIG.name}</p>
        </div>
      </div>

      <div className="space-y-8 text-gray-300">
        <section className="rounded-2xl border border-gray-800 bg-gray-900/40 p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <EyeOff className="h-5 w-5 text-cyan-400" />
            1. Never Share Personal Information
          </h2>
          <p className="text-sm leading-relaxed text-gray-300">
            Never share details that can reveal your real identity, including:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-gray-400 list-disc list-inside">
            <li>Your full name, phone number, or physical home address</li>
            <li>Social media handles (Instagram, Snapchat, Discord, Telegram, etc.)</li>
            <li>Financial info, bank details, cryptocurrency wallets, or payment links</li>
            <li>Place of work, school, campus, or local neighborhood details</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-900/40 p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Flag className="h-5 w-5 text-indigo-400" />
            2. Immediate Reporting and Skipping
          </h2>
          <p className="text-sm leading-relaxed text-gray-300">
            If someone acts inappropriately, threatens you, behaves suspiciously, or violates our community guidelines:
          </p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-xl border border-gray-800 bg-gray-950/60">
              <span className="font-semibold text-white">Press "Report":</span>
              <p className="mt-1 text-gray-400 text-xs">
                Select a reason (harassment, threats, spam, suspected underage user). The report is flagged to our moderation queue and the conversation immediately ends.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-gray-800 bg-gray-950/60">
              <span className="font-semibold text-white">Press "Block":</span>
              <p className="mt-1 text-gray-400 text-xs">
                Permanently prevents you and that user from ever being matched together in future chat sessions.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-800 bg-gray-900/40 p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            3. Adult-Only Platform Pilot (18+)
          </h2>
          <p className="text-sm leading-relaxed text-gray-300">
            {APP_CONFIG.name} is intended exclusively for consenting adults aged 18 and older. While a self-declared checkbox is used in this pilot phase, self-declaration is not proof of age. We are reviewing automated age-assurance mechanisms for future broad releases.
          </p>
          <div className="mt-4 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-200 text-xs leading-relaxed">
            <strong>Important note:</strong> Zero tolerance for child sexual abuse material (CSAM) or any exploitation of minors. Suspected underage accounts or abusive behavior will be banned immediately and reported to authorities where required by law.
          </div>
        </section>
      </div>
    </div>
  );
}
