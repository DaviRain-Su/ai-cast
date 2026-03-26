"use client";

import { createNetworkConfig, SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";
import { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { registerEnokiWallets } from "@mysten/enoki";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState, useEffect } from "react";
import "@mysten/dapp-kit/dist/index.css";

const { networkConfig } = createNetworkConfig({
  testnet: { url: getJsonRpcFullnodeUrl("testnet"), network: "testnet" },
  mainnet: { url: getJsonRpcFullnodeUrl("mainnet"), network: "mainnet" },
});

const ENOKI_API_KEY = process.env.NEXT_PUBLIC_ENOKI_API_KEY;
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

function EnokiRegistration() {
  useEffect(() => {
    if (!ENOKI_API_KEY || !GOOGLE_CLIENT_ID) return;

    const suiClient = new SuiJsonRpcClient({
      url: getJsonRpcFullnodeUrl("testnet"),
      network: "testnet",
    });

    registerEnokiWallets({
      apiKey: ENOKI_API_KEY,
      providers: {
        google: {
          clientId: GOOGLE_CLIENT_ID,
        },
      },
      client: suiClient as any,
      network: "testnet",
    });
  }, []);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>
          <EnokiRegistration />
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
