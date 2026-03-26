"use client";

import { useQuery } from "@tanstack/react-query";
import { suiClient } from "@/lib/sui-client";
import { CREATOR_TYPE } from "@/lib/constants";

export interface CreatorData {
  objectId: string;
  owner: string;
  name: string;
  bio: string;
  avatarBlobId: string | null;
  subscriberCount: number;
  totalTips: number;
}

export function useCreator(address: string | undefined) {
  return useQuery({
    queryKey: ["creator", address],
    queryFn: async () => {
      if (!address) return null;

      const result = await suiClient.getOwnedObjects({
        owner: address,
        filter: { StructType: CREATOR_TYPE },
        options: { showContent: true },
      });

      if (result.data.length === 0) return null;

      const content = result.data[0].data?.content;
      if (content?.dataType !== "moveObject") return null;
      const f = content.fields as Record<string, any>;

      return {
        objectId: result.data[0].data!.objectId,
        owner: f.owner ?? address,
        name: f.name ?? "Unknown",
        bio: f.bio ?? "",
        avatarBlobId: f.avatar_blob_id ?? null,
        subscriberCount: parseInt(f.subscriber_count ?? "0"),
        totalTips: parseInt(f.total_tips ?? "0"),
      } as CreatorData;
    },
    enabled: !!address,
  });
}
