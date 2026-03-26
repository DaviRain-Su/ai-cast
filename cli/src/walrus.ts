import { loadConfig } from "./config.js";

const UPLOAD_TIMEOUT = 5 * 60 * 1000; // 5 分钟
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 秒

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retries = MAX_RETRIES,
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(UPLOAD_TIMEOUT),
      });
      if (response.ok || response.status < 500) return response;
      // 5xx 重试
    } catch (err) {
      if (i === retries - 1) throw err;
    }
    await new Promise((r) => setTimeout(r, RETRY_DELAY * (i + 1)));
  }
  throw new Error("超过最大重试次数");
}

/**
 * 上传 blob 到 Walrus（通过 HTTP Publisher API）
 */
export async function uploadBlob(
  data: Uint8Array,
  options: { epochs?: number } = {}
): Promise<{ blobId: string; suiObjectId: string }> {
  const config = loadConfig();
  const epochs = options.epochs ?? 5;
  const url = `${config.walrusPublisher}/v1/blobs?epochs=${epochs}`;

  const response = await fetchWithRetry(url, {
    method: "PUT",
    headers: { "Content-Type": "application/octet-stream" },
    body: data as any,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Walrus 上传失败 (${response.status}): ${text}`);
  }

  const result = await response.json() as Record<string, any>;

  if (result.newlyCreated?.blobObject) {
    return {
      blobId: result.newlyCreated.blobObject.blobId ?? "",
      suiObjectId: result.newlyCreated.blobObject.id ?? "",
    };
  }

  if (result.alreadyCertified) {
    return {
      blobId: result.alreadyCertified.blobId ?? "",
      suiObjectId: result.alreadyCertified.event?.txDigest ?? "",
    };
  }

  throw new Error(`Walrus 返回未知格式: ${JSON.stringify(result).slice(0, 200)}`);
}

/**
 * 从 Walrus 读取 blob
 */
export async function readBlob(blobId: string): Promise<Uint8Array> {
  const config = loadConfig();
  const url = `${config.walrusAggregator}/v1/blobs/${blobId}`;

  const response = await fetchWithRetry(url, { method: "GET" });
  if (!response.ok) {
    throw new Error(`Walrus 读取失败 (${response.status})`);
  }

  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}
