'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_CONFIG } from '@/lib/constants';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on the chat page for an app-like single-screen experience
  if (pathname === '/chat') {
    return null;
  }

  return (
    <footer className="border-t border-gray-800/80 bg-[#090D15] py-10 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div>
            <div className="text-sm font-semibold text-white tracking-wide">
              {APP_CONFIG.name}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Adults-only pilot (18+). Text-only randomized conversations.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs">
            <Link href="/safety" className="hover:text-white transition-colors">
              Safety Guidelines
            </Link>
            <Link href="/community-guidelines" className="hover:text-white transition-colors">
              Community Rules
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy (Draft)
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Use (Draft)
            </Link>
            <Link href="/support" className="hover:text-white transition-colors">
              Support & Reports
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800/40 pt-6 text-center text-xs text-gray-600">
          &copy; {new Date().getFullYear()} {APP_CONFIG.name}. Built for safe, respectful, random connections.
        </div>
      </div>
    </footer>
  );
}
