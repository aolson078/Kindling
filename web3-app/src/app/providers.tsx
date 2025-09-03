"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useMemo } from "react";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function Providers({ children }: { children: ReactNode }) {
  const queryClient = useMemo(() => new QueryClient(), []);
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";

  const core = (
    <ThemeProvider>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>{children}</RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );

  if (!appId) {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-console
      console.warn(
        "Privy app id missing. Set NEXT_PUBLIC_PRIVY_APP_ID to enable onboarding."
      );
    }
    return core;
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#d4af37",
        },
        loginMethods: ["passkey", "email"],
        embeddedWallets: { createOnLogin: "users-without-wallets" },
      }}
    >
      {core}
    </PrivyProvider>
  );
}
