import { SealClient } from "@mysten/seal";
import { suiClient } from "./sui-client";

// SEAL testnet key server object IDs
const TESTNET_KEY_SERVERS = [
  { objectId: "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75", weight: 1 },
  { objectId: "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8", weight: 1 },
];

let cachedClient: SealClient | null = null;

export function getSealClient(): SealClient {
  if (cachedClient) return cachedClient;
  cachedClient = new SealClient({
    suiClient: suiClient as any,
    serverConfigs: TESTNET_KEY_SERVERS,
    verifyKeyServers: false,
  });
  return cachedClient;
}
