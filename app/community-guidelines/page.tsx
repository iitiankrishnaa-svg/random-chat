import Link from 'next/link';
import { BookOpen, Check, X } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

export default function GuidelinesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
          <BookOpen className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Community Guidelines</h1>
          <p className="text-sm text-gray-400">Rules of respect and safety on {APP_CONFIG.name}</p>
        </div>
      </div>

      <div className="space-y-6 text-sm text-gray-300">
        <div className="p-6 rounded-2xl border border-gray-800 bg-gray-900/40">
          <h2 className="text-lg font-semibold text-emerald-400 mb-3 flex items-center gap-2">
            <Check className="h-5 w-5" /> What We Encourage
          </h2>
          <ul className="space-y-2 list-disc list-inside text-gray-300">
            <li>Polite, engaging, open-minded conversations with people around the world</li>
            <li>Respecting boundaries — if your stranger skips or leaves, accept it gracefully</li>
            <li>Reporting abuse to help keep the environment clean for everyone</li>
            <li>Exercising personal privacy caution at all times</li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl border border-gray-800 bg-gray-900/40">
          <h2 className="text-lg font-semibold text-rose-400 mb-3 flex items-center gap-2">
            <X className="h-5 w-5" /> Strictly Prohibited Conduct
          </h2>
          <ul className="space-y-2.5 list-disc list-inside text-gray-300">
            <li><strong className="text-white">Harassment and Hate Speech:</strong> Racism, sexism, homophobia, violent threats, or targeted bullying.</li>
            <li><strong className="text-white">Exploitation and Minors:</strong> Any contact, content, or behavior involving minors. Instant permanent ban.</li>
            <li><strong className="text-white">Spam and Commercial Solicitation:</strong> Bot scripts, affiliate links, phishing, or financial schemes.</li>
            <li><strong className="text-white">Doxxing and Extortion:</strong> Disclosing anyone's private real-world information or blackmail.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
