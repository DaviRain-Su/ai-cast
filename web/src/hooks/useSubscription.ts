"use client";

import { useQuery } from "@tanstack/react-query";
import { suiClient } from "@/lib/sui-client";
import { SUBSCRIPTION_TYPE } from "@/lib/constants";

/**
 * 检查当前用户是否订阅了某个创作者
 */
export function useSubscriptionStatus(
  subscriberAddress: string | undefined,
  creatorAddress: string | undefined
) {
  return useQuery({
    queryKey: ["subscription", subscriberAddress, creatorAddress],
    queryFn: async () => {
      if (!subscriberAddress || !creatorAddress) return null;

      const result = await suiClient.getOwnedObjects({
        owner: subscriberAddress,
        filter: { StructType: SUBSCRIPTION_TYPE },
        options: { showContent: true },
      });

      // 找到针对该创作者的订阅
      for (const obj of result.data) {
        const content = obj.data?.content;
        if (content?.dataType !== "moveObject") continue;
        const fields = content.fields as Record<string, any>;

        if (fields.creator === creatorAddress && fields.active) {
          return {
            objectId: obj.data!.objectId,
            endEpoch: parseInt(fields.end_epoch ?? "0"),
            active: fields.active as boolean,
          };
        }
      }

      return null;
    },
    enabled: !!subscriberAddress && !!creatorAddress,
  });
}
