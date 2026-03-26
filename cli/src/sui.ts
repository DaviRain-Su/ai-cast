import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { readFileSync } from "fs";
import { loadConfig, type AiCastConfig } from "./config.js";
import { fromBase64 } from "@mysten/sui/utils";

let cachedClient: SuiJsonRpcClient | null = null;
let cachedKeypair: Ed25519Keypair | null = null;

export function getSuiClient(config?: AiCastConfig): SuiJsonRpcClient {
  if (cachedClient) return cachedClient;
  const cfg = config ?? loadConfig();
  cachedClient = new SuiJsonRpcClient({
    url: getJsonRpcFullnodeUrl(cfg.network),
    network: cfg.network,
  });
  return cachedClient;
}

/**
 * 从 Sui keystore 加载密钥对
 * keystore 格式: Base64 编码的密钥数组 JSON
 */
export function getKeypair(config?: AiCastConfig): Ed25519Keypair {
  if (cachedKeypair) return cachedKeypair;
  const cfg = config ?? loadConfig();

  const keystoreRaw = readFileSync(cfg.keystorePath, "utf-8");
  const keys: string[] = JSON.parse(keystoreRaw);

  if (keys.length === 0) {
    throw new Error("Sui keystore 为空，请先通过 sui client 创建地址");
  }

  for (const key of keys) {
    const raw = fromBase64(key);
    // Sui keystore 格式: 第一个字节是 scheme flag (0 = Ed25519)
    if (raw[0] === 0) {
      const keypair = Ed25519Keypair.fromSecretKey(raw.slice(1));
      if (
        !cfg.activeAddress ||
        keypair.getPublicKey().toSuiAddress() === cfg.activeAddress
      ) {
        cachedKeypair = keypair;
        return keypair;
      }
    }
  }

  const raw = fromBase64(keys[0]);
  cachedKeypair = Ed25519Keypair.fromSecretKey(raw.slice(1));
  return cachedKeypair;
}

export function getAddress(config?: AiCastConfig): string {
  return getKeypair(config).getPublicKey().toSuiAddress();
}

/**
 * 签名并执行交易
 */
export async function signAndExecute(tx: Transaction) {
  const config = loadConfig();
  const client = getSuiClient(config);
  const keypair = getKeypair(config);

  const result = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
    options: {
      showEffects: true,
      showObjectChanges: true,
      showEvents: true,
    },
  });

  return result;
}
