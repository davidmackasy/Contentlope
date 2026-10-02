import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Riffi — The buddy behind your brand",
  description: "Give Riffi your website, product or idea. Create slideshows, videos and UGC content, then plan and schedule everything from one place.",
  metadataBase: new URL("https://tryriffi.com"),
  openGraph: { title: "Meet Riffi. The buddy behind your brand.", description: "Turn your ideas into content people want to see. Then let Riffi help you keep showing up.", siteName: "Riffi", url: "https://tryriffi.com", type: "website" },
  twitter: { card: "summary", title: "Riffi — The buddy behind your brand", description: "Create content. Plan it. Keep showing up with Riffi." },
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
