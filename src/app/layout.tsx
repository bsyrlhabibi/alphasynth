import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AlphaSynth — On-Chain Alpha Discovery Engine",
  description:
    "Multi-agent AI system that cross-references on-chain events, social signals, GitHub, and docs to rank crypto opportunities by confidence.",
  keywords: [
    "crypto",
    "alpha",
    "on-chain",
    "ai agents",
    "defi",
    "web3",
    "signal discovery",
  ],
  openGraph: {
    title: "AlphaSynth — On-Chain Alpha Discovery Engine",
    description:
      "Multi-agent AI system for crypto opportunity discovery and ranking.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0f] text-slate-200 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
