import ConstellationCanvas from "@/components/ConstellationCanvas";
import ConnectPanel from "@/components/ConnectPanel";

export default function Home({
  searchParams,
}: {
  searchParams: { profile?: string };
}) {
  const profileCreated = searchParams.profile === "complete";
  return (
    <main className="relative min-h-screen overflow-hidden vignette noise-soft aurora-bg">
      <section className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-32">
        <div className="absolute inset-0 -z-10">
          <ConstellationCanvas />
        </div>
        <div className="max-w-3xl">
          <span className="badge">Open, auditable, human-first</span>
          <h1 className="gradient-title heading-serif text-4xl sm:text-6xl font-semibold tracking-tight mt-4">
            Kindling Protocol
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted leading-relaxed">
            A dark, minimal, inviting dating protocol—transparent by design and
            soft on the eyes. Crypto-invisible when you want it; composable when
            you need it.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <a
              href="#get-started"
              className="btn-primary w-full sm:w-auto"
              aria-label="Jump to get started section"
            >
              Get started
            </a>
            <a
              href="#learn-more"
              className="btn-ghost w-full sm:w-auto"
              aria-label="Jump to learn more section"
            >
              Learn more
            </a>
          </div>
          <div className="microcopy mt-2">
            No seed phrases. No gas. Yours to own.
          </div>
          {profileCreated && (
            <div className="mt-6 rounded-xl bg-green-500/20 text-green-400 p-4">
              Profile saved successfully!
            </div>
          )}
          <div className="mt-6 rounded-xl bg-surface/40 backdrop-blur-xl p-4 pr-5 accent-ring inline-block">
            <ConnectPanel />
          </div>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute right-[-220px] top-[-140px] h-[560px] w-[560px] rounded-full opacity-26 blur-[110px] float-soft"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(110,86,207,0.20), rgba(212,175,55,0.08) 50%, transparent 72%)",
          }}
        />

        <div
          aria-hidden
          className="pointer-events-none absolute left-[-160px] bottom-[-200px] h-[520px] w-[520px] rounded-full opacity-22 blur-[120px] float-soft"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(59,42,122,0.20), rgba(255,59,59,0.06) 50%, transparent 72%)",
          }}
        />

        <div id="learn-more" className="mt-16 sm:mt-28 max-w-4xl">
          <h2 className="text-2xl font-medium heading-serif">Why Kindling</h2>
          <p className="mt-3 text-muted">
            Replace opaque, paywalled dating with an open, community-governed
            protocol. No manipulation. No lock-in. Just signal.
          </p>
          <div className="mt-8 flex flex-col gap-4">
            <div className="rounded-xl bg-surface/40 backdrop-blur-md p-5 border border-white/5">
              <div className="text-sm text-muted">Goal 1</div>
              <div className="mt-1">Transparent, auditable matching logic.</div>
            </div>
            <div className="rounded-xl bg-surface/40 backdrop-blur-md p-5 border border-white/5">
              <div className="text-sm text-muted">Goal 2</div>
              <div className="mt-1">
                Web3 wrapped in Web2 onboarding (passkeys or email, no gas).
              </div>
            </div>
            <div className="rounded-xl bg-surface/40 backdrop-blur-md p-5 border border-white/5">
              <div className="text-sm text-muted">Goal 3</div>
              <div className="mt-1">
                Crypto-invisible UX with optional advanced features.
              </div>
            </div>
            <div className="rounded-xl bg-surface/40 backdrop-blur-md p-5 border border-white/5">
              <div className="text-sm text-muted">Goal 4</div>
              <div className="mt-1">
                Safety-first reputation and adjudication via attestations.
              </div>
            </div>
            <div className="rounded-xl bg-surface/40 backdrop-blur-md p-5 border border-white/5">
              <div className="text-sm text-muted">Goal 5</div>
              <div className="mt-1">
                User ownership and data portability across the ecosystem.
              </div>
            </div>
          </div>
        </div>

        <div id="get-started" className="mt-16 sm:mt-20 max-w-5xl">
          <h2 className="text-2xl font-medium heading-serif">How it works</h2>
          <div className="mt-6 rounded-2xl bg-surface/35 backdrop-blur-xl p-6 border border-white/5">
            <div className="text-muted text-sm">Architecture</div>
            <div className="mt-2">
              Identity (ERC-4337, PoP) → Profile (EAS, IPFS) → Matching (open) →
              Incentives & Moderation
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
