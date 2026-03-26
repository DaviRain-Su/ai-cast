import { SealClient } from "@mysten/seal";
import { loadConfig } from "./config.js";
import { getSuiClient } from "./sui.js";

// SEAL testnet key server object IDs
const TESTNET_KEY_SERVERS = [
  { objectId: "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75", weight: 1 },
  { objectId: "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8", weight: 1 },
];

let cachedSealClient: SealClient | null = null;

export function getSealClient(): SealClient {
  if (cachedSealClient) return cachedSealClient;
  const config = loadConfig();
  const suiClient = getSuiClient(config);

  cachedSealClient = new SealClient({
    suiClient: suiClient as any,
    serverConfigs: TESTNET_KEY_SERVERS,
    verifyKeyServers: false,
  });
  return cachedSealClient;
}

/**
 * 使用 SEAL 加密数据
 * id: 策略标识（使用创作者地址作为 id）
 */
export async function encryptWithSeal(
  data: Uint8Array,
  creatorAddress: string,
): Promise<{ encryptedData: Uint8Array; key: Uint8Array }> {
  const config = loadConfig();
  const sealClient = getSealClient();

  const result = await sealClient.encrypt({
    threshold: 1,
    packageId: config.packageId,
    id: creatorAddress,
    data,
  });

  return {
    encryptedData: result.encryptedObject,
    key: result.key,
  };
}
