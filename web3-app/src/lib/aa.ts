import type { Wallet } from "@privy-io/react-auth";
import {
  createKernelAccountClient,
  createZeroDevPaymasterClient,
  walletClientToSmartAccountSigner,
  type KernelAccountClient,
  PaymasterMode,
} from "@zerodev/sdk";
import { createWalletClient, custom, http } from "viem";
import { sepolia } from "viem/chains";

export type SmartAccountInfo = {
  eoaAddress: string | null;
  smartAccountAddress: string | null;
  isReady: boolean;
};

let kernelClient: KernelAccountClient | null = null;

export function getKernelClient() {
  return kernelClient;
}

export async function ensureSmartAccount(
  wallets: Wallet[] | undefined
): Promise<SmartAccountInfo> {
  const projectId = process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID;
  const wallet = wallets?.find((w) => w.address);
  const eoa = wallet?.address ?? null;

  if (!projectId || !wallet) {
    return {
      eoaAddress: eoa,
      smartAccountAddress: null,
      isReady: Boolean(eoa) && Boolean(projectId),
    };
  }

  try {
    const provider = await wallet.getEthereumProvider();
    const walletClient = createWalletClient({
      account: eoa as `0x${string}`,
      chain: sepolia,
      transport: custom(provider),
    });
    const owner = walletClientToSmartAccountSigner(walletClient);

    const paymaster = createZeroDevPaymasterClient({
      projectId,
      chain: sepolia,
      paymasterContext: { mode: PaymasterMode.SPONSORED },
    });

    kernelClient = await createKernelAccountClient({
      projectId,
      chain: sepolia,
      owner,
      middleware: {
        sponsorUserOperation: paymaster.sponsorUserOperation,
      },
      transport: http(),
    });

    const saAddress = await kernelClient.getAddress();
    return { eoaAddress: eoa, smartAccountAddress: saAddress, isReady: true };
  } catch (error) {
    console.error("ensureSmartAccount error", error);
    kernelClient = null;
    return { eoaAddress: eoa, smartAccountAddress: null, isReady: false };
  }
}

