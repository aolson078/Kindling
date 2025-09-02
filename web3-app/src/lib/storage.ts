/**
 * Upload a Blob to a public IPFS gateway and return the resulting CID string.
 * Uses the /api/v0/add endpoint which many gateways expose.
 */
export async function uploadToIpfs(blob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("file", blob);

  const res = await fetch("https://ipfs.io/api/v0/add", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    throw new Error(`IPFS upload failed: ${res.statusText}`);
  }
  const data = await res.json();
  return data.Hash as string; // CID string
}

/**
 * Upload a pre-signed Arweave transaction and return the transaction ID.
 * The `tx` argument should be the raw transaction bytes already signed by a wallet.
 */
export async function uploadToArweave(tx: Uint8Array): Promise<string> {
  const res = await fetch("https://arweave.net/tx", {
    method: "POST",
    headers: { "Content-Type": "application/octet-stream" },
    body: tx,
  });
  if (!res.ok) {
    throw new Error(`Arweave upload failed: ${res.statusText}`);
  }
  return await res.text();
}
