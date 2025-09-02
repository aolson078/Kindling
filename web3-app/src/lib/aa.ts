import type { Wallet } from "@privy-io/react-auth";
import { createKernelAccountClient } from "@zerodev/sdk";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

export type SmartAccountInfo = {
  eoaAddress: string | null;
  smartAccountAddress: string | null;
  isReady: boolean;
};

export async function ensureSmartAccount(
  wallets: Wallet[] | undefined
): Promise<SmartAccountInfo> {
  const projectId = process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID;
  const eoa = wallets?.find((w) => w.address)?.address ?? null;

  if (!projectId) {
    return {
      eoaAddress: eoa,
      smartAccountAddress: null,
      isReady: Boolean(eoa),
    };
  }

  // TODO: Bridge Privy's embedded wallet to a viem-compatible owner for ZeroDev v5.
  // Until owner wiring is added, return EOA and mark not ready to avoid build/runtime errors.
  // This keeps the UI working while we finalize the owner adapter.
  return { eoaAddress: eoa, smartAccountAddress: null, isReady: false };

  // Example outline once owner is available:
  // const publicClient = createPublicClient({ chain: sepolia, transport: http() });
  // const kernelClient = await createKernelAccountClient({ projectId, chain: sepolia, owner, transport: http(), publicClient });
  // const saAddress = await kernelClient.getAddress();
  // return { eoaAddress: eoa, smartAccountAddress: saAddress, isReady: true };
}
