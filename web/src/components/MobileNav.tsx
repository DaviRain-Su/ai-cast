"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileNav() {
  const account = useCurrentAccount();
  const pathname = usePathname();

  if (!account) return null;

  const isHome = pathname === "/";
  const isProfile = pathname.startsWith(`/creator/${account.address}`);

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#E8E4DB] to-[#FAFAF8] border-t border-shadow z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-14">
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 no-underline ${isHome ? "text-accent" : "text-text-muted"}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <span className="text-[0.5rem] font-bold tracking-[1px] font-mono">DISCOVER</span>
        </Link>

        <Link
          href={`/creator/${account.address}`}
          className={`flex flex-col items-center gap-0.5 no-underline ${isProfile ? "text-accent" : "text-text-muted"}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="text-[0.5rem] font-bold tracking-[1px] font-mono">MY PAGE</span>
        </Link>
      </div>
    </nav>
  );
}
