import { loadConfig } from "./config.js";
import { getKeypair, getSuiClient } from "./sui.js";

/**
 * 上传 blob 到 Walrus（通过 HTTP Publisher API）
 * Walrus Publisher 提供简单的 PUT 接口上传数据
 */
export async function uploadBlob(
  data: Uint8Array,
  options: { epochs?: number } = {}
): Promise<{ blobId: string; suiObjectId: string }> {
  const config = loadConfig();
  const epochs = options.epochs ?? 5;
  const url = `${config.walrusPublisher}/v1/blobs?epochs=${epochs}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/octet-stream",
    },
    body: data as any,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Walrus 上传失败 (${response.status}): ${text}`);
  }

  const result = await response.json() as Record<string, any>;

  // Walrus 返回格式: { newlyCreated: { blobObject: { blobId, id } } }
  // 或: { alreadyCertified: { blobId, ... } }
  if (result.newlyCreated) {
    return {
      blobId: result.newlyCreated.blobObject.blobId,
      suiObjectId: result.newlyCreated.blobObject.id,
    };
  }

  if (result.alreadyCertified) {
    return {
      blobId: result.alreadyCertified.blobId,
      suiObjectId: result.alreadyCertified.event?.txDigest ?? "",
    };
  }

  throw new Error(`Walrus 返回未知格式: ${JSON.stringify(result)}`);
}

/**
 * 从 Walrus 读取 blob
 */
export async function readBlob(blobId: string): Promise<Uint8Array> {
  const config = loadConfig();
  const url = `${config.walrusAggregator}/v1/blobs/${blobId}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Walrus 读取失败 (${response.status})`);
  }

  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}
