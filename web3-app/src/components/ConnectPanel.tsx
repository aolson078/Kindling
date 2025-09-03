"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance, useNetwork } from "wagmi";
import { mainnet } from "wagmi/chains";
import { useState } from "react";

export default function ConnectPanel() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const { data: balance } = useBalance({
    chainId: mainnet.id,
    address,
    query: { enabled: Boolean(address) },
  });
  const [copied, setCopied] = useState(false);

  const formattedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  const copyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address", err);
    }
  };

  return (
    <div className="flex flex-col gap-3 items-start">
      <ConnectButton showBalance={false} />
      {isConnected ? (
        <div className="text-sm">
          <div className="flex items-center gap-2">
            <span>Address: {formattedAddress}</span>
            <button
              onClick={copyAddress}
              className="px-2 py-0.5 text-xs border rounded"
              aria-label="Copy address"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div>
            Network: {chain?.name ?? "Unknown"}
            {chain?.id !== mainnet.id && chain && (
              <span className="text-red-500"> (switch to Mainnet)</span>
            )}
          </div>
          {balance && (
            <div>
              Balance: {balance.formatted} {balance.symbol}
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-muted">Wallet not connected</div>
      )}
    </div>
  );
}


