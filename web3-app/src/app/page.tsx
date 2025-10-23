import Link from "next/link";
import ConstellationCanvas from "@/components/ConstellationCanvas";
import ConnectPanel from "@/components/ConnectPanel";

const navLinks = [
  { href: "#learn-more", label: "Highlights" },
  { href: "#signals", label: "Signals" },
  { href: "#changelog", label: "Changelog" },
  { href: "#get-started", label: "Get started" },
  { href: "#faq", label: "FAQ" },
];

const heroBullets = [
  "Transparent, attestable reputation with Rendezvous receipts gating positive signal.",
  "Passkey-first onboarding that quietly deploys a smart account and sponsors gas.",
  "Composable matchmaking rails that any community client can remix.",
];

const heroHighlights = [
  {
    title: "Composable rails",
    description: "SDK primitives for intents, scoring, and rendezvous flows that every client can extend.",
  },
  {
    title: "Safety-forward",
    description: "Receipts, moderation attestations, and encrypted evidence pipelines by default.",
  },
  {
    title: "Gasless onboarding",
    description: "Passkey-first accounts with sponsored actions so newcomers never touch a seed phrase.",
  },
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

const ecosystemSignals = [
  {
    label: "Active rendezvous",
    value: "8,120",
    change: "+32% month over month",
    tone: "ok",
  },
  {
    label: "Verified guardians",
    value: "142",
    change: "+18 onboarded this quarter",
    tone: "info",
  },
  {
    label: "Attestations issued",
    value: "54,300",
    change: "+4.7k past 7 days",
    tone: "ok",
  },
  {
    label: "Escalations resolved",
    value: "98%",
    change: "Under 36h median response",
    tone: "warn",
  },
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

const upgradeChangelog = [
  {
    version: "2025.02",
    codename: "Aurora mainline",
    date: "Feb 2025",
    status: "Live",
    statusVariant: "ok",
    highlights: [
      "Protocol upgrade shipped with rendezvous receipts gating positive reputation.",
      "Smart account onboarding upgraded with passkey-first Privy + ZeroDev flows.",
      "Matching engine migrated to deterministic, on-chain governed weights.",
    ],
  },
  {
    version: "2024.12",
    codename: "Sentry preview",
    date: "Dec 2024",
    status: "In review",
    statusVariant: "info",
    highlights: [
      "Moderator console released for curated guardians with encrypted evidence review.",
      "Introduced appeals queue with cooldown timers to prevent retaliatory reports.",
      "Safety attestations now portable across ecosystem clients via shared schemas.",
    ],
  },
  {
    version: "2024.09",
    codename: "Beacon cutover",
    date: "Sep 2024",
    status: "Research",
    statusVariant: "warn",
    highlights: [
      "Experimenting with refundable intent stakes to discourage spam matchmaking.",
      "Collecting analytics for match feedback loops and weighted scoring curves.",
      "Designing privacy-preserving liveness attestations for optional verification.",
    ],
  },
];

const faqEntries = [
  {
    question: "How do sponsored actions stay sustainable?",
    answer:
      "We route onboarding transactions through rotating paymasters funded by DAO-set budgets. Guardians vote on the budget each epoch while analytics flag abusive usage for throttling.",
  },
  {
    question: "Can communities run their own scoring curves?",
    answer:
      "Yes. The deterministic weights ship as governance-controlled parameters. Any community client can fork the template contract, adjust multipliers, and publish their configuration as an attestation.",
  },
  {
    question: "What happens if a guardian issues a false report?",
    answer:
      "Appeals queue cases require multi-guardian quorum. Every moderation action emits an attestation that can be challenged, with cooldown periods that prevent instant retaliatory adjustments.",
  },
  {
    question: "Where are encrypted profiles stored?",
    answer:
      "Profile blobs live on IPFS using access-controlled encryption. The smart account only references the CID, while Privy controls who can decrypt based on user consent and guardian policies.",
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
    <main
      id="top"
      className="relative min-h-screen overflow-hidden vignette noise-soft aurora-bg"
    >
      <header className="site-header" aria-label="Primary">
        <Link href="#top" className="logo-lockup" aria-label="Kindling protocol home">
          <span className="logo-glow" aria-hidden />
          <span className="logo-word">Kindling</span>
          <span className="logo-tag">Protocol</span>
        </Link>
        <nav className="nav-links" aria-label="Jump to section">
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          <span className="status-pill status-pill--info nav-status">Beta cohort live</span>
          <a
            href="mailto:hello@kindling.xyz"
            className="nav-cta"
            target="_blank"
            rel="noreferrer"
          >
            Request invite
          </a>
        </div>
      </header>
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
            <div className="hero-highlight-grid">
              {heroHighlights.map((item) => (
                <div key={item.title} className="hero-highlight-card">
                  <h3 className="text-sm uppercase tracking-[0.18em] text-muted">{item.title}</h3>
                  <p className="text-sm text-soft leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
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

      <section id="signals" className="section-shell section-shell--compact">
        <div className="section-intro">
          <h2 className="heading-serif text-3xl font-semibold">Network signals</h2>
          <p className="text-muted text-base sm:text-lg">
            Community-owned analytics surface the pulse of the protocol without exposing personal context.
          </p>
        </div>
        <div className="signal-grid">
          {ecosystemSignals.map((signal) => (
            <article key={signal.label} className={`signal-card signal-card--${signal.tone}`}>
              <p className="signal-label">
                <span className="signal-dot" aria-hidden />
                {signal.label}
              </p>
              <p className="signal-metric heading-serif">{signal.value}</p>
              <p className="signal-delta">{signal.change}</p>
            </article>
          ))}
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

      <section id="changelog" className="section-shell changelog-section">
        <header className="max-w-3xl space-y-4">
          <h2 className="heading-serif text-3xl font-semibold">Upgrade changelog</h2>
          <p className="text-muted text-base sm:text-lg">
            Track how the protocol hardened over time—from early research cuts to today&apos;s live Aurora mainline release.
          </p>
        </header>
        <div className="changelog-grid mt-10">
          {upgradeChangelog.map((entry) => (
            <article key={entry.version} className="changelog-card">
              <header className="changelog-card__header">
                <div>
                  <p className="changelog-card__version">{entry.version}</p>
                  <p className="changelog-card__codename">{entry.codename}</p>
                </div>
                <span className={`status-pill status-pill--${entry.statusVariant}`}>
                  {entry.status}
                </span>
              </header>
              <p className="changelog-card__date">{entry.date}</p>
              <ul className="list-check changelog-card__list">
                {entry.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
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

      <section id="faq" className="section-shell faq-section">
        <header className="max-w-3xl space-y-4">
          <h2 className="heading-serif text-3xl font-semibold">FAQ &amp; playbook</h2>
          <p className="text-muted text-base sm:text-lg">
            Quick answers for operators rolling out the upgrade across their communities.
          </p>
        </header>
        <div className="faq-grid">
          {faqEntries.map((entry) => (
            <details key={entry.question} className="faq-item">
              <summary>
                <span>{entry.question}</span>
              </summary>
              <p>{entry.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
