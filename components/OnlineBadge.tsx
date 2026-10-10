'use client';

import { useOnlineUsers } from '@/hooks/useOnlineUsers';

interface OnlineBadgeProps {
  variant?: 'navbar' | 'hero' | 'toolbar';
  className?: string;
}

export default function OnlineBadge({ variant = 'navbar', className = '' }: OnlineBadgeProps) {
  const count = useOnlineUsers(42);

  if (variant === 'hero') {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] ${className}`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="font-semibold">{count.toLocaleString()}</span>
        <span>Strangers Online Now</span>
      </div>
    );
  }

  if (variant === 'toolbar') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm ${className}`}
        title={`${count} users actively online on StrangerSpace`}
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </span>
        <span className="font-mono font-semibold">{count}</span>
        <span className="hidden sm:inline">Online</span>
      </div>
    );
  }

  // Default navbar variant
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium ${className}`}
      title={`${count} users online`}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      <span className="font-mono font-semibold">{count}</span>
      <span className="hidden xs:inline">Online</span>
    </div>
  );
}
