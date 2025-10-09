"use client";

import { useMemo, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useBalance,
  useChainId,
  useConfig,
  useEnsName,
} from "wagmi";
import { mainnet } from "wagmi/chains";

export default function ConnectPanel() {
  const { address, isConnected, status } = useAccount();
  const chainId = useChainId();
  const { chains } = useConfig();
  const chain = chains.find((c) => c.id === chainId);
  const { data: ensName } = useEnsName({
    address,
    chainId: mainnet.id,
    query: { enabled: Boolean(address) },
  });
  const { data: balance } = useBalance({
    chainId: mainnet.id,
    address,
    query: { enabled: Boolean(address) },
  });
  const [copied, setCopied] = useState(false);

  const formattedAddress = useMemo(() => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  const walletLabel = ensName || formattedAddress || "Wallet not connected";
  const networkHealthy = Boolean(chain && chain.id === mainnet.id);

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

  const connectionStatus = useMemo(() => {
    if (status === "connecting") return "Connecting";
    if (!isConnected) return "Disconnected";
    if (!networkHealthy) return "Wrong network";
    return "Ready";
  }, [isConnected, networkHealthy, status]);

  const statusClass = !isConnected
    ? "status-pill--warn"
    : networkHealthy
    ? "status-pill--ok"
    : "status-pill--warn";

  return (
    <div className="connect-panel">
      <div className="connect-panel__header">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-muted">Wallet</div>
          <div className="mt-1 text-base font-medium heading-serif break-all">{walletLabel}</div>
          {address && (
            <button className="copy-button" onClick={copyAddress} aria-label="Copy address">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
        <ConnectButton chainStatus="icon" showBalance={false} />
      </div>

      <dl className="stat-grid mt-4">
        <div className="stat-block">
          <dt>Connection</dt>
          <dd>
            <span className={`status-pill ${statusClass}`}>{connectionStatus}</span>
          </dd>
        </div>
        <div className="stat-block">
          <dt>Network</dt>
          <dd>
            {chain?.name ?? "Unknown"}
            {!networkHealthy && isConnected && chain && (
              <span className="status-inline">Switch to Mainnet</span>
            )}
          </dd>
        </div>
        <div className="stat-block">
          <dt>Balance snapshot</dt>
          <dd>
            {balance
              ? `${Number.parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`
              : "—"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
