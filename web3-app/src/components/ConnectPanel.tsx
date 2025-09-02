"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance } from "wagmi";
import { mainnet } from "wagmi/chains";

export default function ConnectPanel() {
  const { address, chainId, isConnected } = useAccount();
  const { data: balance } = useBalance({
    chainId: mainnet.id,
    address,
    query: { enabled: Boolean(address) },
  });

  return (
    <div className="flex flex-col gap-3 items-start">
      <ConnectButton showBalance={false} />
      {isConnected && (
        <div className="text-sm">
          <div>Address: {address}</div>
          <div>Chain ID: {chainId}</div>
          {balance && (
            <div>
              Balance: {balance.formatted} {balance.symbol}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


