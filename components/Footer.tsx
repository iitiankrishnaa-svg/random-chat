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
    <footer className="border-t border-white/[0.08] bg-[#070A12] py-12 text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-sm font-bold tracking-tight text-white">
                {APP_CONFIG.name}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Systems Operational
              </span>
            </div>
            <p className="mt-1.5 text-xs text-zinc-500 max-w-md">
              Adults-only anonymous text-chat network (18+). Randomized private conversations with zero retention.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs">
            <Link href="/safety" className="text-zinc-400 hover:text-white transition-colors">
              Safety Guidelines
            </Link>
            <Link href="/community-guidelines" className="text-zinc-400 hover:text-white transition-colors">
              Community Rules
            </Link>
            <Link href="/privacy" className="text-zinc-400 hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-zinc-400 hover:text-white transition-colors">
              Terms of Use
            </Link>
            <Link href="/support" className="text-zinc-400 hover:text-white transition-colors">
              Support & Reports
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-white/[0.05] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <div>
            &copy; {new Date().getFullYear()} {APP_CONFIG.name}. Built for safe, respectful, random connections.
          </div>
          <div className="text-[11px] text-zinc-400">
            Encrypted &bull; Ephemeral &bull; Text-Only
          </div>
        </div>
      </div>
    </footer>
  );
}
