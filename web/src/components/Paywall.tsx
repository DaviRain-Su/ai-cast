"use client";

import Link from "next/link";

interface PaywallProps {
  creatorAddress: string;
  isConnected: boolean;
}

export function Paywall({ creatorAddress, isConnected }: PaywallProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#FAFAF8] to-[#E8E4DB] neu-outset p-8 text-center">
      {/* Lock icon */}
      <div className="w-16 h-16 rounded-full bg-vinyl mx-auto mb-4 flex items-center justify-center shadow-[0_6px_12px_rgba(0,0,0,0.3)]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D9D3C8" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      <h3
        className="text-xl font-normal italic text-[#383532] mb-2"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Premium Content
      </h3>

      <p className="text-[0.75rem] text-text-muted mb-6 font-mono">
        此播客为付费内容，需要订阅该创作者才能收听
      </p>

      {!isConnected ? (
        <p className="text-[0.65rem] text-text-muted font-mono">
          请先连接钱包
        </p>
      ) : (
        <Link
          href={`/creator/${creatorAddress}`}
          className="inline-block px-6 py-3 rounded-full bg-gradient-to-b from-accent to-[#C94530] text-white font-mono text-[0.75rem] font-bold tracking-[2px] no-underline shadow-[0_4px_12px_rgba(222,83,62,0.4)] hover:shadow-[0_6px_16px_rgba(222,83,62,0.5)] transition-all"
        >
          SUBSCRIBE
        </Link>
      )}
    </div>
  );
}
