"use client";

import { useEffect } from "react";
import { usePrivy, type Wallet } from "@privy-io/react-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SmartAccountStatus from "@/components/SmartAccountStatus";
import { ensureSmartAccount } from "@/lib/aa";

export default function OnboardingPage() {
  const { login, ready, authenticated, user } = usePrivy();
  const privyConfigured = Boolean(process.env.NEXT_PUBLIC_PRIVY_APP_ID);
  const router = useRouter();

  useEffect(() => {
    if (!privyConfigured) return;
    if (ready && authenticated && user) {
      (async () => {
        const wallets = (user.linkedAccounts ?? []).filter(
          (a): a is Wallet => a.type === "wallet"
        );
        const info = await ensureSmartAccount(wallets);
        if (!info.isReady) return;
        try {
          const res = await fetch(`/api/profile?userId=${user.id}`);
          const data = await res.json();
          if (!data.found) {
            router.replace("/profile/new");
          }
        } catch {
          router.replace("/profile/new");
        }
      })();
    }
  }, [ready, authenticated, privyConfigured, user, router]);

  return (
    <main className="relative min-h-screen overflow-hidden vignette noise-soft aurora-bg">
      <section className="relative mx-auto max-w-xl px-6 py-24 sm:py-32">
        <h1 className="gradient-title heading-serif text-4xl font-semibold tracking-tight">
          Get started
        </h1>
        <p className="mt-4 text-muted">
          Sign in with a passkey or email. No seed phrases. No gas.
        </p>

        {!privyConfigured && (
          <div className="mt-6 rounded-xl bg-surface/40 backdrop-blur-md p-4 border border-white/5">
            <div className="text-sm text-muted">Onboarding unavailable</div>
            <div className="mt-1">
              Set NEXT_PUBLIC_PRIVY_APP_ID in .env.local to enable sign-in.
            </div>
          </div>
        )}

        {privyConfigured && (
          <>
            <div className="mt-8 flex flex-col gap-3">
              <button
                className="btn-primary"
                onClick={() =>
                  login({ loginMethods: ["passkey"], modal: true })
                }
                disabled={!ready}
              >
                Continue with passkey
              </button>
              <button
                className="btn-ghost"
                onClick={() => login({ loginMethods: ["email"], modal: true })}
                disabled={!ready}
              >
                Continue with email
              </button>
            </div>
            <div className="microcopy mt-4">
              {ready
                ? authenticated
                  ? `Signed in as ${user?.email?.address ?? "user"}`
                  : ""
                : "Loading..."}
            </div>
            {authenticated && <SmartAccountStatus />}
          </>
        )}

        <div className="mt-10">
          <Link className="btn-ghost" href="/">
            Back home
          </Link>
        </div>
      </section>
    </main>
  );
}
