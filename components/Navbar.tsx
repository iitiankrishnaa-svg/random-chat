'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, Shield, HelpCircle, UserCheck } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

export default function Navbar() {
  const pathname = usePathname();
  const isChat = pathname === '/chat';

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b border-gray-800 bg-[#0B0F19]/90 backdrop-blur-md ${
        isChat ? 'hidden sm:flex' : 'flex'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 shadow-md shadow-indigo-500/20">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            {APP_CONFIG.name}
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/chat"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-400 hover:bg-gray-800/80 hover:text-indigo-300 transition-colors"
          >
            <UserCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Start Chat</span>
          </Link>
          <Link
            href="/safety"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-400 hover:bg-gray-800/60 hover:text-white transition-colors"
          >
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Safety</span>
          </Link>
          <Link
            href="/support"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-400 hover:bg-gray-800/60 hover:text-white transition-colors"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Support</span>
          </Link>
          <Link
            href="/admin"
            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-800/40 hover:text-gray-300 transition-colors"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
