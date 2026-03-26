"use client";

import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import Link from "next/link";

export function Header() {
  const account = useCurrentAccount();

  return (
    <header className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 max-w-5xl mx-auto w-full">
      <Link href="/" className="flex items-center gap-2 no-underline flex-shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-accent border border-[#111] shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_0_8px_rgba(222,83,62,0.5)]" />
        <span className="text-[0.7rem] font-bold tracking-[2px] text-text-muted font-mono">
          AI-CAST
        </span>
      </Link>

      <div className="flex items-center gap-2 sm:gap-4">
        {account && (
          <Link
            href={`/creator/${account.address}`}
            className="hidden sm:inline text-[0.65rem] tracking-[1px] text-text-muted hover:text-accent transition-colors no-underline font-mono"
          >
            MY PODCASTS
          </Link>
        )}
        <ConnectButton />
      </div>
    </header>
  );
}
