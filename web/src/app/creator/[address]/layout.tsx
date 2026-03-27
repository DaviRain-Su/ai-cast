import type { Metadata } from "next";
import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";
import { CREATOR_TYPE } from "@/lib/constants";

const suiClient = new SuiJsonRpcClient({
  url: getJsonRpcFullnodeUrl("testnet"),
  network: "testnet",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ address: string }>;
}): Promise<Metadata> {
  const { address } = await params;
  const short = `${address.slice(0, 6)}...${address.slice(-4)}`;

  try {
    const result = await suiClient.getOwnedObjects({
      owner: address,
      filter: { StructType: CREATOR_TYPE },
      options: { showContent: true },
    });

    if (result.data.length === 0) {
      return { title: `${short} — AI-CAST` };
    }

    const content = result.data[0].data?.content;
    if (content?.dataType !== "moveObject") {
      return { title: `${short} — AI-CAST` };
    }

    const fields = content.fields as Record<string, any>;
    const name = fields.name ?? short;
    const bio = fields.bio ?? "AI-CAST Creator";

    return {
      title: `${name} — AI-CAST`,
      description: bio,
      openGraph: {
        title: name,
        description: bio,
        type: "profile",
        siteName: "AI-CAST",
      },
      twitter: {
        card: "summary",
        title: name,
        description: bio,
      },
    };
  } catch {
    return { title: `${short} — AI-CAST` };
  }
}

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
