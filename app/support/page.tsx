import { Mail, HelpCircle, ShieldAlert, Clock } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
          <HelpCircle className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Support & Safety Inquiries</h1>
          <p className="text-sm text-gray-400">Assistance and safety contact information for {APP_CONFIG.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <div className="p-6 rounded-2xl border border-gray-800 bg-gray-900/40">
          <h2 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
            <Mail className="h-5 w-5 text-indigo-400" />
            Safety & Moderation Contact
          </h2>
          <p className="text-gray-400 text-xs leading-relaxed mb-4">
            For urgent safety concerns, legal requests, or appeals, you can reach out via our safety desk:
          </p>
          <div className="inline-block px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-800 font-mono text-xs text-indigo-300">
            {APP_CONFIG.supportEmail}
          </div>
          <p className="mt-3 text-xs text-gray-500">
            (Placeholder email for draft pilot; configure your domain safety inbox prior to public launch).
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-gray-800 bg-gray-900/40">
          <h2 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-400" />
            Operator Response Window
          </h2>
          <p className="text-gray-400 text-xs leading-relaxed">
            As a solo-operated indie pilot, reports submitted through the in-app "Report" tool are queued and reviewed asynchronously. 24/7 real-time monitoring is not available; use the in-app "Block" and "Leave" tools immediately whenever you encounter inappropriate behavior.
          </p>
        </div>
      </div>
    </div>
  );
}
