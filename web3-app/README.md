Web3 starter using Next.js (TS), RainbowKit, wagmi, and viem.

## Getting Started

Env setup:

```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start by editing `src/app/page.tsx`. The page auto-updates as you edit.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Contracts

Contracts live in `../contracts` (Foundry style). Install Foundry and run:

- Local chain: `anvil`
- Build: `cd ../contracts && forge build`
- Deploy: `cd ../contracts && forge script script/Deploy.s.sol --broadcast --rpc-url http://localhost:8545`
- Export ABI to app: `make abi` (requires Make and Foundry)
