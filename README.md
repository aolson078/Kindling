# Kindling Protocol White Paper

## Abstract

Centralized online dating is broken. Today’s platforms amplify the imbalance between men and women, exploiting frustration and low success rates as a business model. A single monopoly conglomerate controls most of the market, profiting from manipulative algorithms, fake competition, and predatory paywalls. The result is animosity, harassment, and wasted time for nearly everyone.

Kindling is the first open-source Web3 dating protocol designed to replace this system with a fairer, safer alternative. At its core is a privacy-preserving reputation network: users communicate privately, but harmful interactions can be escalated through anonymized evidence and zero knowledge proofs. The community can validate claims without exposing sensitive details, and perpetrators carry a transparent, portable reputation score that cannot be hidden or monopolized.

Powered by attestations, smart accounts, and gasless onboarding, Kindling delivers a crypto-invisible experience that feels like Web2 while ensuring users, not corporations, govern the rules. The endgame is a dating ecosystem rooted in its true Layer 0: the people themselves, finally free from monopoly control.

## Introduction

Dating apps dominate the modern social landscape, yet suffer from structural flaws:

- Opaque and manipulative algorithms.
- Pay-to-play mechanics that prioritize revenue over meaningful connections.
- Rampant bot activity, scams, and low-intent behavior.
- Lack of user control over identity, data, and portability.

Kindling addresses these issues with a protocol-first design: an open-source, auditable layer for identity, matching, and incentives, with a reference app built in React + TypeScript.

## Goals

1. **Transparent, auditable matching logic**222

   - Matching algorithms are open-source and community governed.
   - No hidden boosts, pay-to-win mechanics, or opaque ranking.

2. **Web3 wrapped in Web2 onboarding**

   - No seed phrases, no gas fees, no friction.
   - Users sign up with passkeys or email, creating a smart account invisibly under the hood.

3. **Crypto-invisible UX**

   - The app feels like Web2, but is powered by decentralized infrastructure.
   - Users only see crypto features if they choose to opt in.

4. **Safety-first reputation and moderation**

   - Privacy-preserving public reputation network to reduce harassment and abuse.
   - Transparent adjudication of reports, with portable outcomes across apps.

5. **User ownership and portability**
   - Profiles, preferences, and reputation belong to the user.
   - Attestations make data portable across the Kindling ecosystem and beyond.

## Protocol Design

### Identity Layer

- Smart accounts via ERC-4337 with passkey or email onboarding.
- Optional Proof-of-Personhood integrations (World ID, BrightID).
- Reputation as attestations, portable across apps.

### Profile Data

- Minimal PII on-chain.
- IPFS/Arweave pointers for encrypted profile blobs.
- Attestations for preferences, verification, and safety signals.

### Match Engine

- Open, transparent scoring function.
- Deterministic where possible.
- Tunable parameters governed by community.

### Incentives & Safety

- Anti-spam: refundable micro-stakes, cooldowns, rate limits.
- Anti-ghosting: reply timers, credit slashing for no-shows.
- Safety reports: encrypted evidence, adjudicated via attestations.

### UX Requirements

- Passkey or email onboarding.
- Sponsored gas (via paymaster).
- Progressive disclosure for advanced crypto users.

## Architecture Overview

```
[User] → [Kindling dApp (React, TS)] → [Kindling Protocol (EVM L2)]
       → Identity (ERC-4337, PoP)
       → Profile (EAS attestations, IPFS)
       → Matching Engine (open algorithm)
       → Incentives & Moderation
```

## Roadmap

1. RFC-0001: Protocol Overview
2. ADR-0001: Passkey Smart Accounts + Sponsored Gas
3. MVP: Onboarding → Profile → Match → First Message
4. Safety & Incentive Layers
5. Governance & Expansion

## Conclusion

Kindling aims to be the foundation for a safer, fairer, and more transparent dating ecosystem. By separating protocol from app and prioritizing user love over monetization, it reimagines digital matchmaking for the Web3 era.
