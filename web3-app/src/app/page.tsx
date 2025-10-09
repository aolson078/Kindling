import Link from "next/link";
import ConstellationCanvas from "@/components/ConstellationCanvas";
import ConnectPanel from "@/components/ConnectPanel";

const heroBullets = [
  "Transparent, attestable reputation with Rendezvous receipts gating positive signal.",
  "Passkey-first onboarding that quietly deploys a smart account and sponsors gas.",
  "Composable matchmaking rails that any community client can remix.",
];

const featureHighlights = [
  {
    tag: "Identity",
    title: "Attested smart profiles",
    description:
      "Every handle, preference, and safety claim is written as an EAS attestation so reputation travels wherever you go.",
    detail: "ProfileManager now emits structured attestations while exposing encrypted profile blobs via IPFS CIDs.",
  },
  {
    tag: "Matching",
    title: "Deterministic scoring",
    description:
      "The MatchEngine upgrade removes opaque boosts in favor of transparent weights that are governed on-chain.",
    detail: "Profile similarity and address entropy are tuned through community-set weights with instant audit trails.",
  },
  {
    tag: "Onboarding",
    title: "Gasless first date",
    description:
      "Passkeys or email create a smart account through Privy + ZeroDev, so people can join without touching a seed phrase.",
    detail: "4337 paymasters underwrite the first actions while embedded wallets stay invisible until advanced mode is enabled.",
  },
  {
    tag: "Safety",
    title: "Receipts before reputation",
    description:
      "Positive reputation adjustments now require Rendezvous receipts, making proof-of-presence the default for praise.",
    detail: "Safety reports surface verified encounters without exposing sensitive coordinates or timestamps to the chain.",
  },
  {
    tag: "Moderation",
    title: "Community review board",
    description:
      "Moderators escalate encrypted evidence, vote, and issue attestations that follow bad actors across the ecosystem.",
    detail: "A new appeals queue and cooldown timers prevent brigading while keeping outcomes portable across apps.",
  },
  {
    tag: "Developers",
    title: "Composable SDK",
    description:
      "Clients tap the same viem + wagmi stack with typed ABIs, prebuilt UI primitives, and starter flows for rendezvous.",
    detail: "The upgraded ABI export flow syncs Hardhat artifacts directly into the Next.js app with one command.",
  },
];

const protocolLayers = [
  {
    title: "Create your smart profile",
    body: "Authenticate with passkey or email, mint an embedded wallet, and attest your handle + encrypted profile blob.",
    bullets: [
      "4337 smart accounts with sponsored gas",
      "Encrypted IPFS profile payloads",
      "Human ownership without seed phrases",
    ],
  },
  {
    title: "Earn portable reputation",
    body: "Issue or receive attestations for vibes, verification, and rendezvous receipts that feed into moderation tooling.",
    bullets: [
      "Rendezvous receipts enforce proof-of-presence",
      "Safety reports with encrypted evidence",
      "Community weighted moderation outcomes",
    ],
  },
  {
    title: "Match with open algorithms",
    body: "Transparent scoring surfaces compatible matches without invisible boosts or locked-down ranking logic.",
    bullets: [
      "Deterministic weight curves tuned by governance",
      "Spam controls via refundable intent stakes",
      "APIs that any dating client can embed",
    ],
  },
];

const guardrails = [
  "Refundable micro-stakes to discourage spam and low-intent swiping.",
  "Cooldowns and rendezvous receipts required before positive reputation lands.",
  "Portable moderation attestations to keep serial harassers out across the network.",
  "Opt-in privacy layers so sensitive evidence never hits the public chain.",
];

const roadmap = [
  {
    label: "Shipping now",
    body: "Protocol upgrade deployed to Base + Sepolia with reference dApp and safety module online.",
  },
  {
    label: "Q1 2025",
    body: "Reputation appeals dashboard, match feedback loops, and intent staking analytics go live.",
  },
  {
    label: "Q2 2025",
    body: "DAO-managed treasury for moderation bounties and privacy-preserving liveness attestations ship next.",
  },
];

const upgradeStats = [
  {
    label: "Release tag",
    value: "Protocol upgrade · 2025.02",
  },
  {
    label: "Launch status",
    value: "Private beta with curated guardians",
  },
  {
    label: "Matching engine",
    value: "v2 deterministic scoring",
  },
  {
    label: "Safety net",
    value: "Receipts + moderated attestations",
  },
];

type HomeSearchParams = { profile?: string };

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<HomeSearchParams> | HomeSearchParams;
}) {
  const resolvedSearchParams =
    typeof (searchParams as Promise<HomeSearchParams>).then === "function"
      ? await (searchParams as Promise<HomeSearchParams>)
      : (searchParams as HomeSearchParams);

  const profileCreated = resolvedSearchParams?.profile === "complete";

  return (
    <main className="relative min-h-screen overflow-hidden vignette noise-soft aurora-bg">
      <section className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-28">
        <div className="absolute inset-0 -z-10">
          <ConstellationCanvas density={0.00075} />
        </div>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="space-y-8">
            <div className="pill-upgrade">
              <span className="pill-dot" aria-hidden />
              <span>Protocol upgrade · Winter 2025</span>
            </div>
            <header className="space-y-6">
              <div>
                <h1 className="gradient-title heading-serif text-4xl sm:text-6xl font-semibold tracking-tight">
                  Kindling Protocol · Upgrade Release
                </h1>
                <p className="mt-5 text-base sm:text-lg text-muted leading-relaxed max-w-2xl">
                  A calmer, smarter dating layer—now with attested profiles, rendezvous receipts, and a transparent
                  matching engine governed by the community.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link href="#get-started" className="btn-primary w-full sm:w-auto" aria-label="Jump to get started">
                  Launch the app
                </Link>
                <Link
                  href="https://github.com/zerodevapp/kindling"
                  className="btn-ghost w-full sm:w-auto"
                  target="_blank"
                  rel="noreferrer"
                >
                  Read the docs
                </Link>
              </div>
            </header>
            <ul className="list-check max-w-2xl space-y-3">
              {heroBullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <div className="microcopy">No seed phrases. No gas. Yours to own.</div>
            {profileCreated && (
              <div className="upgrade-alert" role="status">
                <span aria-hidden>✓</span>
                <span>Profile saved successfully. Welcome aboard.</span>
              </div>
            )}
            <div className="surface-panel accent-ring">
              <ConnectPanel />
            </div>
          </div>
          <aside className="space-y-5">
            <div className="surface-panel surface-panel--muted">
              <h2 className="text-xs uppercase tracking-[0.2em] text-muted">Upgrade at a glance</h2>
              <dl className="stat-grid mt-4">
                {upgradeStats.map(({ label, value }) => (
                  <div key={label} className="stat-block">
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="surface-panel">
              <h2 className="text-xs uppercase tracking-[0.2em] text-muted">Guardians online</h2>
              <p className="mt-3 text-sm text-muted">
                Moderators, safety partners, and DAO stewards can attest, appeal, and review directly from the dashboard.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="status-pill status-pill--ok">Safety desk active</span>
                <span className="status-pill status-pill--info">Appeals queue live</span>
                <span className="status-pill status-pill--warn">Spam slashing enabled</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section id="learn-more" className="section-shell">
        <header className="max-w-3xl space-y-4">
          <h2 className="heading-serif text-3xl font-semibold">What changed in this upgrade</h2>
          <p className="text-muted text-base sm:text-lg">
            From attestations to moderation, every touchpoint now ships with transparent defaults and composable APIs.
          </p>
        </header>
        <div className="feature-grid mt-10">
          {featureHighlights.map((feature) => (
            <article key={feature.title} className="feature-card">
              <span className="feature-card__tag">{feature.tag}</span>
              <h3 className="heading-serif text-xl font-medium">{feature.title}</h3>
              <p className="text-sm text-soft leading-relaxed">{feature.description}</p>
              <p className="feature-card__meta">{feature.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="get-started" className="section-shell">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <h2 className="heading-serif text-3xl font-semibold">How it works</h2>
            <ol className="upgrade-steps">
              {protocolLayers.map((layer, idx) => (
                <li key={layer.title}>
                  <div className="step-index" aria-hidden>
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium heading-serif">{layer.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{layer.body}</p>
                    <ul className="list-dash">
                      {layer.bullets.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <aside className="surface-panel surface-panel--stack">
            <div>
              <h3 className="text-sm uppercase tracking-[0.2em] text-muted">Guardrails</h3>
              <ul className="list-dash mt-3">
                {guardrails.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="hr-faint my-6" />
            <div>
              <h3 className="text-sm uppercase tracking-[0.2em] text-muted">Roadmap</h3>
              <ul className="timeline mt-4">
                {roadmap.map((item) => (
                  <li key={item.label}>
                    <span className="timeline__dot" aria-hidden />
                    <div>
                      <p className="timeline__label">{item.label}</p>
                      <p className="timeline__body">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
