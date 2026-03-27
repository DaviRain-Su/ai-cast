"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { PodcastCard } from "@/components/PodcastCard";
import { PodcastGridSkeleton } from "@/components/Skeleton";
import { useDiscoverPodcasts } from "@/hooks/usePodcasts";
import { STYLE_LABELS } from "@/lib/constants";

const FILTER_OPTIONS = [
  { key: "all", label: "ALL" },
  { key: "free", label: "FREE" },
  { key: "premium", label: "PREMIUM" },
];

const STYLE_OPTIONS = [
  { key: "all", label: "ALL STYLES" },
  ...Object.entries(STYLE_LABELS).map(([key, label]) => ({ key, label })),
];

const SORT_OPTIONS = [
  { key: "newest", label: "NEWEST" },
  { key: "most_tipped", label: "MOST TIPPED" },
];

export default function DiscoverPage() {
  const { data: podcasts, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } = useDiscoverPodcasts();
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [styleFilter, setStyleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const filtered = useMemo(() => {
    if (!podcasts) return [];
    let result = [...podcasts];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Tier filter
    if (tierFilter === "free") result = result.filter((p) => p.tier === 0);
    if (tierFilter === "premium") result = result.filter((p) => p.tier === 1);

    // Style filter
    if (styleFilter !== "all") result = result.filter((p) => p.style === styleFilter);

    // Sort
    if (sortBy === "most_tipped") {
      result.sort((a, b) => b.tipTotal - a.tipTotal);
    }

    return result;
  }, [podcasts, search, tierFilter, styleFilter, sortBy]);

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        {/* Hero */}
        <div className="py-8 sm:py-12 text-center">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-normal italic leading-tight text-[#383532]"
            style={{
              fontFamily: "var(--font-serif)",
              textShadow: "0 1px 1px rgba(255,255,255,0.8)",
            }}
          >
            Discover AI Podcasts,
            <br />
            on-chain.
          </h1>
          <p className="text-[0.65rem] tracking-[3px] text-text-muted mt-4 font-mono uppercase">
            Powered by Sui & Walrus
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-shadow-deep border-b border-highlight opacity-60 mb-6" />

        {/* Search + Filters */}
        <div className="mb-6 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
              fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索播客..."
              className="w-full bg-surface rounded-xl pl-10 pr-4 py-3 text-[0.78rem] font-mono text-text outline-none neu-inset focus:shadow-[inset_0_3px_6px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.7),0_0_0_2px_rgba(222,83,62,0.15)] transition-shadow"
            />
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-2">
            {/* Tier filter */}
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setTierFilter(opt.key)}
                className={`px-3 py-1.5 rounded-full text-[0.55rem] font-bold tracking-[1px] font-mono border-none cursor-pointer transition-all ${
                  tierFilter === opt.key
                    ? "bg-gradient-to-b from-accent to-[#C94530] text-white shadow-[0_2px_6px_rgba(222,83,62,0.3)]"
                    : "bg-gradient-to-b from-[#FAFAF8] to-[#E8E4DB] neu-outset text-text-muted hover:text-text"
                }`}
              >
                {opt.label}
              </button>
            ))}

            <div className="w-px bg-shadow-deep mx-1 self-stretch" />

            {/* Style filter */}
            {STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setStyleFilter(opt.key)}
                className={`px-3 py-1.5 rounded-full text-[0.55rem] font-bold tracking-[1px] font-mono border-none cursor-pointer transition-all ${
                  styleFilter === opt.key
                    ? "bg-gradient-to-b from-accent to-[#C94530] text-white shadow-[0_2px_6px_rgba(222,83,62,0.3)]"
                    : "bg-gradient-to-b from-[#FAFAF8] to-[#E8E4DB] neu-outset text-text-muted hover:text-text"
                }`}
              >
                {opt.label}
              </button>
            ))}

            {/* Sort */}
            <div className="ml-auto flex gap-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSortBy(opt.key)}
                  className={`px-3 py-1.5 rounded-full text-[0.55rem] font-bold tracking-[1px] font-mono border-none cursor-pointer transition-all ${
                    sortBy === opt.key
                      ? "text-accent bg-surface neu-inset"
                      : "text-text-muted hover:text-text"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section label */}
        <div className="text-[0.65rem] font-bold tracking-[2px] text-text-muted mb-4 font-mono">
          {search
            ? `RESULTS // ${filtered.length} FOUND`
            : `DISCOVER // ${filtered.length} PODCASTS`}
        </div>

        {/* Content */}
        {isLoading && <PodcastGridSkeleton count={4} />}

        {error && (
          <div className="text-center py-20">
            <p className="text-sm text-accent font-mono">
              {(error as Error).message}
            </p>
          </div>
        )}

        {!isLoading && filtered.length === 0 && podcasts && podcasts.length > 0 && (
          <div className="text-center py-16">
            <p className="text-sm text-text-muted font-mono">没有匹配的播客</p>
            <button
              onClick={() => { setSearch(""); setTierFilter("all"); setStyleFilter("all"); }}
              className="text-[0.65rem] text-accent mt-2 font-mono border-none bg-transparent cursor-pointer"
            >
              清除筛选
            </button>
          </div>
        )}

        {!isLoading && podcasts && podcasts.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-vinyl mx-auto mb-6 flex items-center justify-center shadow-[0_8px_16px_rgba(0,0,0,0.3)]">
              <div className="w-7 h-7 rounded-full bg-[#D9D3C8] border border-[#111] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-base" />
              </div>
            </div>
            <p className="text-sm text-text-muted font-mono">暂无播客</p>
            <p className="text-[0.65rem] text-text-muted mt-2 font-mono tracking-[1px]">
              使用 CLI 发布你的第一期播客: <code className="text-accent">ai-cast publish</code>
            </p>
          </div>
        )}

        {filtered.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((podcast) => (
                <PodcastCard key={podcast.objectId} podcast={podcast} />
              ))}
            </div>

            {/* Load More */}
            {hasNextPage && !search && (
              <div className="text-center mt-8">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-b from-[#FAFAF8] to-[#E8E4DB] neu-outset font-mono text-[0.65rem] font-bold tracking-[1px] text-text-muted cursor-pointer border-none active:neu-active active:translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {isFetchingNextPage ? "LOADING..." : "LOAD MORE"}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
