"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { uploadToIpfs } from "@/lib/storage";
import { useAccount, useWalletClient } from "wagmi";
import { useRouter } from "next/navigation";

export default function NewProfilePage() {
  const { user } = usePrivy();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      setError("Not authenticated");
      return;
    }
    try {
      const image = imageFile ? await fileToBase64(imageFile) : null;
      const profile = { displayName, pronouns, ageRange, image };
      const encoder = new TextEncoder();
      const jsonData = encoder.encode(JSON.stringify(profile));

      // derive symmetric key from user session id
      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(user.id),
        "PBKDF2",
        false,
        ["deriveKey"]
      );
      const key = await crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: encoder.encode("kindling-salt"),
          iterations: 100000,
          hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt"]
      );
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        jsonData
      );

      const payload = {
        iv: Array.from(iv),
        data: Array.from(new Uint8Array(encrypted)),
      };
      const blob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      const cid = await uploadToIpfs(blob);

      if (!walletClient || !address) {
        throw new Error("Wallet not connected");
      }

      const easSdk = await import(
        "@ethereum-attestation-service/eas-sdk"
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { EAS, SchemaEncoder } = easSdk as any;
      const eas = new EAS(
        process.env.NEXT_PUBLIC_EAS_CONTRACT_ADDRESS || ""
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      eas.connect(walletClient as any);
      const schemaEncoder = new SchemaEncoder(
        "string cid,uint64 timestamp,address user"
      );
      const encodedData = schemaEncoder.encodeData([
        { name: "cid", value: cid, type: "string" },
        {
          name: "timestamp",
          value: BigInt(Date.now()),
          type: "uint64",
        },
        { name: "user", value: address, type: "address" },
      ]);
      const tx = await eas.attest({
        schema: process.env.NEXT_PUBLIC_EAS_SCHEMA_UID || "",
        data: {
          recipient: address,
          data: encodedData,
          revocable: true,
        },
      });
      const newAttestationId = await tx.wait();
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          cid,
          attestationId: newAttestationId,
        }),
      });
      localStorage.setItem("profileComplete", "true");
      router.replace("/?profile=complete");
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden vignette noise-soft aurora-bg">
      <section className="relative mx-auto max-w-xl px-6 py-24 sm:py-32">
        <h1 className="gradient-title heading-serif text-4xl font-semibold tracking-tight">
          Create your profile
        </h1>
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div>
            <label className="block text-sm" htmlFor="displayName">
              Display name
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              required
              className="mt-1 w-full rounded-md border border-white/10 bg-black/10 p-2"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm" htmlFor="pronouns">
              Pronouns
            </label>
            <input
              id="pronouns"
              name="pronouns"
              type="text"
              className="mt-1 w-full rounded-md border border-white/10 bg-black/10 p-2"
              value={pronouns}
              onChange={(e) => setPronouns(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm" htmlFor="ageRange">
              Age range
            </label>
            <input
              id="ageRange"
              name="ageRange"
              type="text"
              className="mt-1 w-full rounded-md border border-white/10 bg-black/10 p-2"
              value={ageRange}
              onChange={(e) => setAgeRange(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm" htmlFor="image">
              Profile image
            </label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              className="mt-1 w-full"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </div>
          <button type="submit" className="btn-primary mt-4">
            Save profile
          </button>
        </form>
        {error && (
          <div className="mt-4 text-sm text-red-500">Error: {error}</div>
        )}
      </section>
    </main>
  );
}
