"use client";

import { useState } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PACKAGE_ID } from "@/lib/constants";
import { useToast } from "./Toast";

interface SubscribeButtonProps {
  creatorProfileId: string;
  creatorAddress: string;
  isSubscribed?: boolean;
  onSuccess?: () => void;
}

const SUBSCRIPTION_OPTIONS = [
  { label: "1 Epoch", epochs: 1, cost: 100_000_000, costLabel: "0.1 SUI" },
  { label: "5 Epochs", epochs: 5, cost: 400_000_000, costLabel: "0.4 SUI" },
  { label: "10 Epochs", epochs: 10, cost: 700_000_000, costLabel: "0.7 SUI" },
];

export function SubscribeButton({
  creatorProfileId,
  creatorAddress,
  isSubscribed,
  onSuccess,
}: SubscribeButtonProps) {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const { toast } = useToast();
  const [showOptions, setShowOptions] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  // 不显示给创作者本人
  if (!account || account.address === creatorAddress) {
    return null;
  }

  const handleSubscribe = async (epochs: number, cost: number) => {
    try {
      setStatus("idle");
      const tx = new Transaction();

      const [coin] = tx.splitCoins(tx.gas, [cost]);

      const subscription = tx.moveCall({
        target: `${PACKAGE_ID}::subscription::subscribe`,
        arguments: [
          tx.object(creatorProfileId),
          tx.pure.u64(epochs),
          coin,
        ],
      });

      // 订阅对象转给调用者
      tx.transferObjects([subscription], account.address);

      await signAndExecute({ transaction: tx });
      setStatus("success");
      setShowOptions(false);
      toast("订阅成功！", "success");
      onSuccess?.();
    } catch (err) {
      console.error("Subscribe failed:", err);
      setStatus("error");
      toast("订阅失败", "error");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={isPending}
        className={`px-6 py-3 rounded-full font-mono text-[0.75rem] font-bold tracking-[2px] cursor-pointer border-none transition-all disabled:opacity-50 ${
          isSubscribed
            ? "bg-surface neu-inset text-text-muted"
            : "bg-gradient-to-b from-accent to-[#C94530] text-white shadow-[0_4px_12px_rgba(222,83,62,0.4)] hover:shadow-[0_6px_16px_rgba(222,83,62,0.5)] active:translate-y-0.5"
        }`}
      >
        {isPending
          ? "PROCESSING..."
          : status === "success"
            ? "SUBSCRIBED!"
            : isSubscribed
              ? "SUBSCRIBED"
              : "SUBSCRIBE"}
      </button>

      {showOptions && !isSubscribed && (
        <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-gradient-to-b from-[#FAFAF8] to-[#E8E4DB] rounded-xl neu-outset p-4 z-20 min-w-[240px]">
          <div className="text-[0.55rem] font-bold tracking-[2px] text-text-muted mb-3 font-mono text-center">
            SELECT PLAN
          </div>
          <div className="flex flex-col gap-2">
            {SUBSCRIPTION_OPTIONS.map((opt) => (
              <button
                key={opt.epochs}
                onClick={() => handleSubscribe(opt.epochs, opt.cost)}
                disabled={isPending}
                className="flex justify-between items-center px-4 py-2.5 rounded-lg bg-surface neu-inset font-mono text-[0.65rem] text-text hover:text-accent cursor-pointer border-none transition-colors disabled:opacity-50"
              >
                <span className="font-bold">{opt.label}</span>
                <span className="text-text-muted">{opt.costLabel}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {status === "error" && (
        <p className="text-[0.55rem] text-accent mt-1 font-mono text-center">
          订阅失败
        </p>
      )}
    </div>
  );
}
