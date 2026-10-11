'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, Shield, HelpCircle, UserCheck } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';
import OnlineBadge from '@/components/OnlineBadge';

export default function Navbar() {
  const pathname = usePathname();
  const isChat = pathname === '/chat';

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#080C14]/80 backdrop-blur-xl transition-all ${
        isChat ? 'hidden sm:flex' : 'flex'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/" className="group flex items-center gap-2.5 transition-transform active:scale-95">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#090D18]">
                <MessageSquare className="h-4.5 w-4.5 text-indigo-400 group-hover:text-cyan-300 transition-colors" />
              </div>
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              {APP_CONFIG.name}
            </span>
          </Link>

          <OnlineBadge variant="navbar" />
        </div>

        <nav className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/chat"
            className="flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-600/20 to-cyan-500/20 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-indigo-300 hover:text-white hover:border-indigo-400/50 hover:bg-indigo-600/30 transition-all shadow-sm shadow-indigo-950/40"
          >
            <UserCheck className="h-4 w-4 text-indigo-400" />
            <span className="hidden sm:inline">Start Chat</span>
            <span className="sm:hidden">Chat</span>
          </Link>
          <Link
            href="/safety"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium text-zinc-400 hover:bg-white/[0.05] hover:text-white transition-colors"
          >
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Safety</span>
          </Link>
          <Link
            href="/support"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium text-zinc-400 hover:bg-white/[0.05] hover:text-white transition-colors"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Support</span>
          </Link>
          <Link
            href="/admin"
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300 transition-colors"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
