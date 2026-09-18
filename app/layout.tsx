import type { Metadata, Viewport } from "next";
import { config } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(config.siteUrl),
  title: {
    default: "醉乡堂 · Clash of Clans 部落",
    template: "%s · 醉乡堂",
  },
  description:
    "醉月频中圣，迷花不事君。五湖四海皆兄弟，醉乡堂里认神州。Clash of Clans 部落：部落战、联赛、竞赛、十级都城，兼顾休闲娱乐，欢迎四海兄弟加入。",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
  keywords: [
    "醉乡堂",
    "Clash of Clans",
    "部落冲突",
    "部落联盟",
    "联赛报名",
  ],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "醉乡堂",
    title: "醉乡堂 · Clash of Clans 部落",
    description:
      "五湖四海皆兄弟，醉乡堂里认神州。部落战、联赛、竞赛、十级都城，期待你的加入。",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#223a33",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className="paper-grain min-h-screen bg-paper font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
