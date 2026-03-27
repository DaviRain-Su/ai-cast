"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="rounded-2xl bg-gradient-to-b from-[#FAFAF8] to-[#E8E4DB] neu-outset p-8 max-w-sm w-full text-center">
        <div className="text-2xl mb-4 font-mono text-text-muted">⚠</div>
        <h2 className="text-sm font-bold text-text mb-2 font-mono">出错了</h2>
        <p className="text-[0.65rem] text-text-muted mb-6 font-mono break-all">
          {error.message || "未知错误"}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="text-[0.65rem] font-bold tracking-[1px] text-text bg-surface rounded-full px-4 py-2 neu-outset hover:translate-y-[-1px] transition-all font-mono"
          >
            重试
          </button>
          <Link
            href="/"
            className="text-[0.65rem] font-bold tracking-[1px] text-text-muted bg-surface rounded-full px-4 py-2 neu-outset hover:translate-y-[-1px] transition-all no-underline font-mono"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
