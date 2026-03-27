"use client";

import Link from "next/link";
import { STYLE_LABELS, WALRUS_AGGREGATOR } from "@/lib/constants";

export interface PodcastData {
  objectId: string;
  title: string;
  description: string;
  creator: string;
  audioBlobId: string;
  scriptBlobId: string | null;
  coverBlobId: string | null;
  durationSecs: number;
  style: string;
  sourceUrl: string | null;
  tier: number;
  tipTotal: number;
  playCount: number;
}

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function PodcastCard({ podcast }: { podcast: PodcastData }) {
  return (
    <Link
      href={`/podcast/${podcast.objectId}`}
      className="block rounded-2xl bg-gradient-to-b from-[#FAFAF8] to-[#E8E4DB] neu-outset p-5 hover:translate-y-[-2px] transition-all duration-200 no-underline group"
    >
      {/* Mini vinyl / cover art */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full flex-shrink-0 overflow-hidden shadow-[0_4px_8px_rgba(0,0,0,0.3)]">
          {podcast.coverBlobId ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${WALRUS_AGGREGATOR}/v1/blobs/${podcast.coverBlobId}`}
              alt={podcast.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-vinyl flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-[#D9D3C8] border border-[#111] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-base shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]" />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-text truncate group-hover:text-accent transition-colors font-mono">
            {podcast.title}
          </h3>

          <Link
            href={`/creator/${podcast.creator}`}
            className="text-[0.6rem] text-text-muted hover:text-accent transition-colors no-underline font-mono"
            onClick={(e) => e.stopPropagation()}
          >
            {shortenAddress(podcast.creator)}
          </Link>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-3 mt-3 flex-wrap">
        <span className="text-[0.55rem] font-bold tracking-[1px] text-text-muted bg-surface rounded-full px-2.5 py-1 neu-inset font-mono">
          {STYLE_LABELS[podcast.style] ?? podcast.style}
        </span>

        {podcast.durationSecs > 0 && (
          <span className="text-[0.55rem] text-text-muted font-mono">
            {formatDuration(podcast.durationSecs)}
          </span>
        )}

        {podcast.tier === 1 && (
          <span className="text-[0.55rem] font-bold tracking-[1px] text-accent font-mono">
            PREMIUM
          </span>
        )}

        <span className="text-[0.55rem] text-text-muted ml-auto font-mono">
          {podcast.tipTotal > 0 ? `${podcast.tipTotal} SUI` : ""}
        </span>
      </div>
    </Link>
  );
}
