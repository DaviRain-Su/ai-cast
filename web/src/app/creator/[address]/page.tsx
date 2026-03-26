"use client";

import { use } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Header } from "@/components/Header";
import { PodcastCard } from "@/components/PodcastCard";
import { SubscribeButton } from "@/components/SubscribeButton";
import { useCreator } from "@/hooks/useCreator";
import { usePodcastsByOwner } from "@/hooks/usePodcasts";
import { useSubscriptionStatus } from "@/hooks/useSubscription";

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
}

export default function CreatorPage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params);
  const account = useCurrentAccount();
  const { data: creator, isLoading: loadingCreator, refetch: refetchCreator } = useCreator(address);
  const { data: podcasts, isLoading: loadingPodcasts } = usePodcastsByOwner(address);
  const { data: subscription, refetch: refetchSub } = useSubscriptionStatus(account?.address, address);

  const isLoading = loadingCreator || loadingPodcasts;

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        {/* Creator Profile Card */}
        <div className="rounded-2xl bg-gradient-to-b from-[#FAFAF8] to-[#E8E4DB] neu-outset p-8 mt-8 text-center">
          {/* Avatar placeholder */}
          <div className="w-20 h-20 rounded-full bg-vinyl mx-auto mb-4 flex items-center justify-center shadow-[0_6px_12px_rgba(0,0,0,0.3)]">
            <div className="w-7 h-7 rounded-full bg-[#D9D3C8] border border-[#111] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-base shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]" />
            </div>
          </div>

          {isLoading ? (
            <div className="w-6 h-6 border-2 border-text-muted border-t-transparent rounded-full animate-spin mx-auto" />
          ) : (
            <>
              <h1
                className="text-2xl font-normal italic text-[#383532] mb-2"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {creator?.name ?? "Creator"}
              </h1>

              {creator?.bio && (
                <p className="text-[0.75rem] text-text-muted mb-4 font-mono">
                  {creator.bio}
                </p>
              )}

              <p className="text-[0.6rem] tracking-[1px] text-text-muted font-mono">
                {shortenAddress(address)}
              </p>

              <div className="flex justify-center gap-6 sm:gap-8 mt-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-text font-mono">
                    {podcasts?.length ?? 0}
                  </div>
                  <div className="text-[0.55rem] tracking-[1px] text-text-muted font-mono">
                    PODCASTS
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-text font-mono">
                    {creator?.subscriberCount ?? 0}
                  </div>
                  <div className="text-[0.55rem] tracking-[1px] text-text-muted font-mono">
                    SUBSCRIBERS
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-text font-mono">
                    {creator?.totalTips ?? 0}
                  </div>
                  <div className="text-[0.55rem] tracking-[1px] text-text-muted font-mono">
                    SUI TIPPED
                  </div>
                </div>
              </div>

              {/* Subscribe Button */}
              {creator && (
                <div className="mt-6">
                  <SubscribeButton
                    creatorProfileId={creator.objectId}
                    creatorAddress={address}
                    isSubscribed={!!subscription}
                    onSuccess={() => { refetchCreator(); refetchSub(); }}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-shadow-deep border-b border-highlight opacity-60 my-8" />

        {/* Podcasts */}
        <div className="text-[0.65rem] font-bold tracking-[2px] text-text-muted mb-6 font-mono">
          PODCASTS // {podcasts?.length ?? 0} EPISODES
        </div>

        {loadingPodcasts && (
          <div className="text-center py-12">
            <div className="w-6 h-6 border-2 border-text-muted border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}

        {!loadingPodcasts && podcasts && podcasts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-text-muted font-mono">暂无播客</p>
          </div>
        )}

        {podcasts && podcasts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {podcasts.map((podcast) => (
              <PodcastCard key={podcast.objectId} podcast={podcast} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
