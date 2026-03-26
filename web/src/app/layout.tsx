import type { Metadata } from "next";
import { Providers } from "./providers";
import { MobileNav } from "@/components/MobileNav";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI-CAST — Decentralized Podcast Platform",
  description: "AI-powered podcasts on Sui & Walrus",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <ToastProvider>
            {children}
            <MobileNav />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
