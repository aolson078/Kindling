"use client";

import { useEffect, useState } from "react";
import { usePrivy, type Wallet } from "@privy-io/react-auth";
import { ensureSmartAccount, type SmartAccountInfo } from "@/lib/aa";

export default function SmartAccountStatus() {
  const { user, ready, authenticated } = usePrivy();
  const [info, setInfo] = useState<SmartAccountInfo | null>(null);
  const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (!ready || !authenticated) return;
      setLoading(true);
      (async () => {
        const wallets = (user?.linkedAccounts ?? []).filter(
          (a): a is Wallet => a.type === "wallet"
        );
        const result = await ensureSmartAccount(wallets);
        setInfo(result);
        setLoading(false);
      })();
    }, [ready, authenticated, user]);

  if (!ready) return <div className="text-muted">Checking wallet…</div>;
  if (!authenticated) return null;

  return (
    <div className="mt-4 rounded-xl bg-surface/40 backdrop-blur-md p-4 border border-white/5">
      <div className="text-sm text-muted">Account</div>
      {loading ? (
        <div className="mt-1">Preparing smart account…</div>
      ) : (
        <>
          <div className="mt-1">EOA: {info?.eoaAddress ?? "–"}</div>
          {info?.smartAccountAddress && (
            <div className="mt-1">
              Smart Account: {info.smartAccountAddress}
            </div>
          )}
          <div className="mt-1">
            Gasless ready: {info?.isReady ? "Yes" : "No"}
          </div>
        </>
      )}
    </div>
  );
}
