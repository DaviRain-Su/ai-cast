import type { Metadata } from "next";
import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";
import { PACKAGE_ID, STYLE_LABELS } from "@/lib/constants";

const suiClient = new SuiJsonRpcClient({
  url: getJsonRpcFullnodeUrl("testnet"),
  network: "testnet",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const result = await suiClient.getObject({
      id,
      options: { showContent: true },
    });

    const content = result.data?.content;
    if (content?.dataType !== "moveObject") {
      return { title: "AI-CAST" };
    }

    const fields = content.fields as Record<string, any>;
    const title = fields.title ?? "AI-CAST Podcast";
    const style = STYLE_LABELS[fields.style] ?? fields.style ?? "";
    const duration = parseInt(fields.duration_secs ?? "0");
    const mins = Math.floor(duration / 60);
    const description = `${style} | ${mins} min | AI-CAST on Sui & Walrus`;

    return {
      title: `${title} — AI-CAST`,
      description,
      openGraph: {
        title,
        description,
        type: "music.song",
        siteName: "AI-CAST",
      },
      twitter: {
        card: "summary",
        title,
        description,
      },
    };
  } catch {
    return { title: "AI-CAST" };
  }
}

export default function PodcastLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
