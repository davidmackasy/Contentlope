import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ContentPilot — Your brand, your next great post",
  description: "Create connected TikTok and Instagram carousels with your brand, products and ideas.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
