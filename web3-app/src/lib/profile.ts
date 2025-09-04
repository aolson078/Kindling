import { uploadToIpfs } from './storage';

// Basic profile fields before encryption
export interface ProfileBlob {
  handle: string;
  bio?: string;
  preferences?: string[];
}

/**
 * Encrypt a profile object using AES-GCM.
 * The resulting blob contains the IV followed by ciphertext.
 */
export async function encryptProfile(profile: ProfileBlob, key: CryptoKey): Promise<Blob> {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(profile));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  const result = new Uint8Array(iv.length + cipher.byteLength);
  result.set(iv, 0);
  result.set(new Uint8Array(cipher), iv.length);
  return new Blob([result], { type: 'application/octet-stream' });
}

/**
 * Decrypt a previously encrypted profile blob.
 */
export async function decryptProfile(blob: Blob, key: CryptoKey): Promise<ProfileBlob> {
  const buf = new Uint8Array(await blob.arrayBuffer());
  const iv = buf.slice(0, 12);
  const cipher = buf.slice(12);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
  const decoder = new TextDecoder();
  return JSON.parse(decoder.decode(plain));
}

/**
 * Encrypt a profile and upload the ciphertext to IPFS.
 * Returns the resulting CID that can be stored on-chain.
 */
export async function saveProfile(profile: ProfileBlob, key: CryptoKey): Promise<string> {
  const encrypted = await encryptProfile(profile, key);
  return uploadToIpfs(encrypted);
}
