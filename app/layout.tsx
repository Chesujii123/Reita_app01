import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "シフト管理",
  description: "現場のシフトをカレンダーで管理するアプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
