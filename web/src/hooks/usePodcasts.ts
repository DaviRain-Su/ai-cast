"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { suiClient } from "@/lib/sui-client";
import { PODCAST_TYPE } from "@/lib/constants";
import type { PodcastData } from "@/components/PodcastCard";

interface PodcastPublishedEvent {
  podcast_id: string;
  creator: string;
  title: string;
  audio_blob_id: string;
  tier: number;
}

function parsePodcast(obj: any): PodcastData | null {
  const content = obj.data?.content;
  if (content?.dataType !== "moveObject") return null;
  const f = content.fields as Record<string, any>;

  return {
    objectId: obj.data.objectId,
    title: f.title ?? "",
    description: f.description ?? "",
    creator: f.creator ?? "",
    audioBlobId: f.audio_blob_id ?? "",
    scriptBlobId: f.script_blob_id ?? null,
    coverBlobId: f.cover_blob_id ?? null,
    durationSecs: parseInt(f.duration_secs ?? "0"),
    style: f.style ?? "deep_dive",
    sourceUrl: f.source_url ?? null,
    tier: parseInt(f.tier ?? "0"),
    tipTotal: parseInt(f.tip_total ?? "0"),
    playCount: parseInt(f.play_count ?? "0"),
  };
}

/**
 * 查询某个地址拥有的所有播客
 */
export function usePodcastsByOwner(owner: string | undefined) {
  return useQuery({
    queryKey: ["podcasts", "owner", owner],
    queryFn: async () => {
      if (!owner) return [];
      const result = await suiClient.getOwnedObjects({
        owner,
        filter: { StructType: PODCAST_TYPE },
        options: { showContent: true },
      });
      return result.data
        .map(parsePodcast)
        .filter((p): p is PodcastData => p !== null);
    },
    enabled: !!owner,
  });
}

/**
 * 查询单个播客对象
 */
export function usePodcast(objectId: string) {
  return useQuery({
    queryKey: ["podcast", objectId],
    queryFn: async () => {
      const result = await suiClient.getObject({
        id: objectId,
        options: { showContent: true, showOwner: true },
      });
      if (!result.data) throw new Error("播客不存在");
      return parsePodcast({ data: result.data });
    },
    enabled: !!objectId,
  });
}

const PAGE_SIZE = 20;

type EventCursor = { eventSeq: string; txDigest: string };

/**
 * 发现页 — 分页查询播客
 * 使用 queryEvents + cursor 实现无限滚动
 */
export function useDiscoverPodcasts() {
  const query = useInfiniteQuery<
    { podcasts: PodcastData[]; nextCursor: EventCursor | null; hasMore: boolean },
    Error,
    { pages: { podcasts: PodcastData[]; nextCursor: EventCursor | null; hasMore: boolean }[] },
    string[],
    EventCursor | null
  >({
    queryKey: ["podcasts", "discover"],
    queryFn: async ({ pageParam }) => {
      const events = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PODCAST_TYPE.replace("::Podcast", "::PodcastPublished")}`,
        },
        order: "descending",
        limit: PAGE_SIZE,
        ...(pageParam ? { cursor: pageParam } : {}),
      });

      if (events.data.length === 0) {
        return { podcasts: [] as PodcastData[], nextCursor: null, hasMore: false };
      }

      const objectIds = events.data
        .map((e) => (e.parsedJson as PodcastPublishedEvent | null)?.podcast_id)
        .filter((id): id is string => !!id);

      if (objectIds.length === 0) {
        return { podcasts: [] as PodcastData[], nextCursor: null, hasMore: false };
      }

      const objects = await suiClient.multiGetObjects({
        ids: objectIds,
        options: { showContent: true, showOwner: true },
      });

      const podcasts = objects
        .map((obj) => parsePodcast({ data: obj.data }))
        .filter((p): p is PodcastData => p !== null);

      return {
        podcasts,
        nextCursor: (events.nextCursor as EventCursor) ?? null,
        hasMore: events.hasNextPage,
      };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
  });

  const allPodcasts = query.data?.pages.flatMap((p) => p.podcasts) ?? [];

  return {
    data: allPodcasts,
    isLoading: query.isLoading,
    error: query.error,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
