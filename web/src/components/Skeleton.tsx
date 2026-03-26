"use client";

export function PodcastCardSkeleton() {
  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#FAFAF8] to-[#E8E4DB] neu-outset p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-shadow flex-shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-shadow rounded w-3/4 mb-2" />
          <div className="h-3 bg-shadow rounded w-1/3" />
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <div className="h-5 bg-shadow rounded-full w-16" />
        <div className="h-5 bg-shadow rounded-full w-10" />
      </div>
    </div>
  );
}

export function PodcastGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <PodcastCardSkeleton key={i} />
      ))}
    </div>
  );
}
