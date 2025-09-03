import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import ThemeToggle from "@/components/ThemeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Kindling Protocol",
  description: "Dark, minimal, trustless ignition for onchain coordination.",
  metadataBase: new URL("https://kindling.example"),
  twitter: {
    card: "summary_large_image",
    title: "Kindling Protocol",
    description: "Dark, minimal, trustless ignition for onchain coordination.",
  },
  openGraph: {
    title: "Kindling Protocol",
    description: "Dark, minimal, trustless ignition for onchain coordination.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} antialiased`}
      >
        {/* RainbowKit/Wagmi/ReactQuery Providers */}
        {/* eslint-disable-next-line @next/next/no-head-element */}
        <Providers>
          <div className="absolute top-4 right-4 z-50">
            <ThemeToggle />
          </div>
          {children}
        </Providers>
      </body>
    </html>
  );
}
