"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useCurrentAccount, useSignPersonalMessage } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { Header } from "@/components/Header";
import { VinylPlayer } from "@/components/VinylPlayer";
import { TipButton } from "@/components/TipButton";
import { Paywall } from "@/components/Paywall";
import { usePodcast } from "@/hooks/usePodcasts";
import { useCreator } from "@/hooks/useCreator";
import { useSubscriptionStatus } from "@/hooks/useSubscription";
import { WALRUS_AGGREGATOR, STYLE_LABELS, PACKAGE_ID } from "@/lib/constants";
import { suiClient } from "@/lib/sui-client";
import { getSealClient } from "@/lib/seal-client";
import { SessionKey } from "@mysten/seal";
import Link from "next/link";

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function PodcastPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const account = useCurrentAccount();
  const { data: podcast, isLoading, error, refetch } = usePodcast(id);
  const { data: creator } = useCreator(podcast?.creator);
  const { data: subscription } = useSubscriptionStatus(account?.address, podcast?.creator);
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [decryptError, setDecryptError] = useState<string | null>(null);
  const [script, setScript] = useState<string | null>(null);

  const isPremium = podcast?.tier === 1;
  const hasAccess = !isPremium || !!subscription;

  // 从 Walrus 加载免费音频
  useEffect(() => {
    if (!podcast?.audioBlobId || isPremium) return;

    setIsLoadingAudio(true);
    fetch(`${WALRUS_AGGREGATOR}/v1/blobs/${podcast.audioBlobId}`)
      .then((res) => {
        if (!res.ok) throw new Error("音频加载失败");
        return res.blob();
      })
      .then((blob) => {
        setAudioUrl(URL.createObjectURL(blob));
      })
      .catch(console.error)
      .finally(() => setIsLoadingAudio(false));
  }, [podcast?.audioBlobId, isPremium]);

  // SEAL 解密付费音频
  const decryptAndPlay = useCallback(async () => {
    if (!podcast?.audioBlobId || !account || !subscription) return;

    setIsLoadingAudio(true);
    setDecryptError(null);

    try {
      // 1. 从 Walrus 获取加密音频
      const res = await fetch(`${WALRUS_AGGREGATOR}/v1/blobs/${podcast.audioBlobId}`);
      if (!res.ok) throw new Error("加密音频加载失败");
      const encryptedData = new Uint8Array(await res.arrayBuffer());

      // 2. 创建 SessionKey
      const sessionKey = await SessionKey.create({
        address: account.address,
        packageId: PACKAGE_ID,
        ttlMin: 30,
        suiClient: suiClient as any,
      });

      // 3. 签名 personal message（用钱包签名而非 keypair）
      const personalMessage = sessionKey.getPersonalMessage();
      const { signature } = await signPersonalMessage({ message: personalMessage });
      await sessionKey.setPersonalMessageSignature(signature);

      // 4. 构建 seal_approve 交易（不执行，只是构建字节）
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::seal_policy::seal_approve`,
        arguments: [
          tx.pure.vector("u8", Array.from(new TextEncoder().encode(podcast.creator))),
          tx.object(subscription.objectId),
        ],
      });
      const txBytes = await tx.build({ client: suiClient as any });

      // 5. 用 SEAL 解密
      const sealClient = getSealClient();
      const decryptedBytes = await sealClient.decrypt({
        data: encryptedData,
        sessionKey,
        txBytes,
      });

      // 6. 播放解密后的音频
      const blob = new Blob([new Uint8Array(decryptedBytes)], { type: "audio/ogg" });
      setAudioUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("SEAL decrypt failed:", err);
      setDecryptError((err as Error).message);
    } finally {
      setIsLoadingAudio(false);
    }
  }, [podcast, account, subscription, signPersonalMessage]);

  // 自动尝试解密（如果是付费内容且有订阅）
  useEffect(() => {
    if (isPremium && hasAccess && !audioUrl && !isLoadingAudio && account) {
      decryptAndPlay();
    }
  }, [isPremium, hasAccess, audioUrl, isLoadingAudio, account, decryptAndPlay]);

  // 从 Walrus 加载文字稿（文字稿始终免费）
  useEffect(() => {
    if (!podcast?.scriptBlobId) return;

    fetch(`${WALRUS_AGGREGATOR}/v1/blobs/${podcast.scriptBlobId}`)
      .then((res) => {
        if (!res.ok) throw new Error("文字稿加载失败");
        return res.text();
      })
      .then(setScript)
      .catch(console.error);
  }, [podcast?.scriptBlobId]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-text-muted border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !podcast) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="text-center py-32">
          <p className="text-accent font-mono">播客不存在或已删除</p>
          <Link href="/" className="text-[0.65rem] text-text-muted mt-4 block font-mono">
            返回发现页
          </Link>
        </div>
      </div>
    );
  }

  const mins = Math.floor(podcast.durationSecs / 60);
  const secs = podcast.durationSecs % 60;

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-lg mx-auto px-4 sm:px-6 pb-16">
        {/* Title section */}
        <div className="text-center pt-8 pb-6">
          <h1
            className="text-2xl md:text-3xl font-normal italic leading-tight text-[#383532] mb-3"
            style={{
              fontFamily: "var(--font-serif)",
              textShadow: "0 1px 1px rgba(255,255,255,0.8)",
            }}
          >
            {podcast.title}
          </h1>

          <Link
            href={`/creator/${podcast.creator}`}
            className="text-[0.65rem] tracking-[1px] text-text-muted hover:text-accent transition-colors no-underline font-mono"
          >
            by {shortenAddress(podcast.creator)}
          </Link>
        </div>

        {/* Paywall or Player */}
        {isPremium && !hasAccess ? (
          <div className="py-6">
            <Paywall
              creatorAddress={podcast.creator}
              isConnected={!!account}
            />
          </div>
        ) : (
          <div className="py-6">
            <VinylPlayer
              audioUrl={audioUrl}
              title={podcast.title}
              isLoading={isLoadingAudio}
            />
            {decryptError && (
              <p className="text-[0.6rem] text-accent text-center mt-3 font-mono">
                解密失败: {decryptError}
              </p>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-shadow-deep border-b border-highlight opacity-60 my-6" />

        {/* Meta info */}
        <div className="flex items-center gap-3 flex-wrap mb-6">
          <span className="text-[0.55rem] font-bold tracking-[1px] text-text-muted bg-surface rounded-full px-3 py-1.5 neu-inset font-mono">
            {STYLE_LABELS[podcast.style] ?? podcast.style}
          </span>

          {podcast.durationSecs > 0 && (
            <span className="text-[0.55rem] text-text-muted font-mono">
              {mins}:{secs.toString().padStart(2, "0")}
            </span>
          )}

          {isPremium && (
            <span className="text-[0.55rem] font-bold tracking-[1px] text-accent font-mono">
              PREMIUM
            </span>
          )}

          {podcast.tipTotal > 0 && (
            <span className="text-[0.55rem] text-text-muted font-mono">
              {podcast.tipTotal} SUI tipped
            </span>
          )}

          {/* Tip Button */}
          {creator && (
            <div className="ml-auto">
              <TipButton
                podcastObjectId={podcast.objectId}
                creatorProfileId={creator.objectId}
                onSuccess={() => refetch()}
              />
            </div>
          )}
        </div>

        {/* Description */}
        {podcast.description && (
          <div className="mb-6">
            <div className="text-[0.65rem] font-bold tracking-[2px] text-text-muted mb-3 font-mono">
              DESCRIPTION
            </div>
            <p className="text-sm text-text leading-relaxed font-mono">
              {podcast.description}
            </p>
          </div>
        )}

        {/* Source URL */}
        {podcast.sourceUrl && (
          <div className="mb-6">
            <div className="text-[0.65rem] font-bold tracking-[2px] text-text-muted mb-2 font-mono">
              SOURCE
            </div>
            <a
              href={podcast.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.7rem] text-accent hover:underline font-mono break-all"
            >
              {podcast.sourceUrl}
            </a>
          </div>
        )}

        {/* Script / Transcript */}
        {script && (
          <>
            <div className="h-px bg-shadow-deep border-b border-highlight opacity-60 my-6" />
            <div className="text-[0.65rem] font-bold tracking-[2px] text-text-muted mb-3 font-mono">
              TRANSCRIPT
            </div>
            <div className="rounded-xl bg-surface neu-inset p-4 max-h-96 overflow-y-auto">
              <p className="text-[0.75rem] text-text leading-relaxed whitespace-pre-wrap font-mono">
                {script}
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
