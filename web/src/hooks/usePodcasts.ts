"use client";

import { useQuery } from "@tanstack/react-query";
import { suiClient } from "@/lib/sui-client";
import { PODCAST_TYPE } from "@/lib/constants";
import type { PodcastData } from "@/components/PodcastCard";

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

/**
 * 发现页 — 查询最近发布的播客
 * 使用 queryEvents 查询 PodcastPublished 事件来获取所有播客
 */
export function useDiscoverPodcasts() {
  return useQuery({
    queryKey: ["podcasts", "discover"],
    queryFn: async () => {
      // 查询 PodcastPublished 事件获取所有 podcast ID
      const events = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PODCAST_TYPE.replace("::Podcast", "::PodcastPublished")}`,
        },
        order: "descending",
        limit: 50,
      });

      if (events.data.length === 0) return [];

      // 批量获取播客对象详情
      const objectIds = events.data
        .map((e) => (e.parsedJson as any)?.podcast_id)
        .filter(Boolean);

      if (objectIds.length === 0) return [];

      const objects = await suiClient.multiGetObjects({
        ids: objectIds,
        options: { showContent: true, showOwner: true },
      });

      return objects
        .map((obj) => parsePodcast({ data: obj.data }))
        .filter((p): p is PodcastData => p !== null);
    },
  });
}
