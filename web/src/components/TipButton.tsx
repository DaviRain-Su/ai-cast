"use client";

import { useState } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID } from "@/lib/constants";
import { useToast } from "./Toast";

interface TipButtonProps {
  podcastObjectId: string;
  creatorProfileId: string;
  onSuccess?: () => void;
}

const TIP_AMOUNTS = [
  { label: "0.1 SUI", value: 100_000_000 },
  { label: "0.5 SUI", value: 500_000_000 },
  { label: "1 SUI", value: 1_000_000_000 },
];

export function TipButton({ podcastObjectId, creatorProfileId, onSuccess }: TipButtonProps) {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const { toast } = useToast();
  const [showPicker, setShowPicker] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleTip = async (amount: number) => {
    if (!account) return;

    try {
      setStatus("idle");
      const tx = new Transaction();

      const [coin] = tx.splitCoins(tx.gas, [amount]);

      tx.moveCall({
        target: `${PACKAGE_ID}::tipping::tip`,
        arguments: [
          tx.object(podcastObjectId),
          tx.object(creatorProfileId),
          coin,
        ],
      });

      await signAndExecute({ transaction: tx });
      setStatus("success");
      setShowPicker(false);
      toast("打赏成功！", "success");
      onSuccess?.();
    } catch (err) {
      console.error("Tip failed:", err);
      setStatus("error");
      toast("打赏失败", "error");
    }
  };

  if (!account) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(!showPicker)}
        disabled={isPending}
        aria-label="打赏"
        aria-expanded={showPicker}
        className="px-5 py-2.5 rounded-full bg-gradient-to-b from-[#FAFAF8] to-[#E8E4DB] neu-outset font-mono text-[0.7rem] font-bold tracking-[1px] text-text cursor-pointer border-none active:neu-active active:translate-y-0.5 transition-all disabled:opacity-50"
      >
        {isPending ? "SENDING..." : status === "success" ? "TIPPED!" : "TIP"}
      </button>

      {showPicker && (
        <div className="absolute top-full mt-2 right-0 bg-gradient-to-b from-[#FAFAF8] to-[#E8E4DB] rounded-xl neu-outset p-3 flex gap-2 z-20">
          {TIP_AMOUNTS.map((tip) => (
            <button
              key={tip.value}
              onClick={() => handleTip(tip.value)}
              disabled={isPending}
              className="px-3 py-2 rounded-lg bg-surface neu-inset font-mono text-[0.6rem] font-bold text-text-muted hover:text-accent cursor-pointer border-none transition-colors disabled:opacity-50"
            >
              {tip.label}
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
