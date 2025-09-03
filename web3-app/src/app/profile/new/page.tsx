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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState({
    displayName: "",
    pronouns: "",
    ageRange: "",
    image: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleDisplayNameChange = (value: string) => {
    setDisplayName(value);
    setFieldErrors((e) => ({
      ...e,
      displayName: value.trim() ? "" : "Display name is required",
    }));
  };

  const handlePronounsChange = (value: string) => {
    setPronouns(value);
    setFieldErrors((e) => ({
      ...e,
      pronouns: value.trim() ? "" : "Pronouns are required",
    }));
  };

  const handleAgeRangeChange = (value: string) => {
    setAgeRange(value);
    setFieldErrors((e) => ({
      ...e,
      ageRange: value.trim() ? "" : "Age range is required",
    }));
  };

  const handleImageChange = (file: File | null) => {
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFieldErrors((e) => ({ ...e, image: "" }));
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

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
      setSuccess(true);
      setError(null);
      setTimeout(() => router.replace("/?profile=complete"), 1500);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const validateStep = () => {
    if (step === 1) {
      handleDisplayNameChange(displayName);
      if (!displayName.trim()) {
        setError("Display name is required");
        return false;
      }
    }
    if (step === 2) {
      handlePronounsChange(pronouns);
      handleAgeRangeChange(ageRange);
      if (!pronouns.trim() || !ageRange.trim()) {
        setError("Please provide pronouns and age range");
        return false;
      }
    }
    setError(null);
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((s) => Math.min(totalSteps, s + 1));
    }
  };

  const prevStep = () => {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  };

  return (
    <main className="relative min-h-screen overflow-hidden vignette noise-soft aurora-bg">
      <section className="relative mx-auto max-w-xl px-6 py-24 sm:py-32">
        <h1 className="gradient-title heading-serif text-4xl font-semibold tracking-tight">
          Create your profile
        </h1>
        <div className="mt-4 text-sm text-muted">
          Step {step} of {totalSteps}
        </div>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          {step === 1 && (
            <div>
              <label className="block text-sm" htmlFor="displayName">
                Display name
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                className="mt-1 w-full rounded-md border border-white/10 bg-black/10 p-2"
                value={displayName}
                onChange={(e) => handleDisplayNameChange(e.target.value)}
              />
              {fieldErrors.displayName ? (
                <p className="mt-1 text-xs text-red-500">
                  {fieldErrors.displayName}
                </p>
              ) : (
                displayName && (
                  <p className="mt-1 text-xs text-green-500">Looks good!</p>
                )
              )}
            </div>
          )}
          {step === 2 && (
            <>
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
                  onChange={(e) => handlePronounsChange(e.target.value)}
                />
                {fieldErrors.pronouns ? (
                  <p className="mt-1 text-xs text-red-500">
                    {fieldErrors.pronouns}
                  </p>
                ) : (
                  pronouns && (
                    <p className="mt-1 text-xs text-green-500">Looks good!</p>
                  )
                )}
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
                  onChange={(e) => handleAgeRangeChange(e.target.value)}
                />
                {fieldErrors.ageRange ? (
                  <p className="mt-1 text-xs text-red-500">
                    {fieldErrors.ageRange}
                  </p>
                ) : (
                  ageRange && (
                    <p className="mt-1 text-xs text-green-500">Looks good!</p>
                  )
                )}
              </div>
            </>
          )}
          {step === 3 && (
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
                onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Profile preview"
                  className="mt-2 h-24 w-24 rounded-full object-cover"
                />
              )}
            </div>
          )}
          <div className="mt-4 flex gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="btn-ghost"
              >
                Back
              </button>
            )}
            {step < totalSteps && (
              <button
                type="button"
                onClick={nextStep}
                className="btn-primary"
              >
                Next
              </button>
            )}
            {step === totalSteps && (
              <button type="submit" className="btn-primary">
                Save profile
              </button>
            )}
          </div>
        </form>
        {error && (
          <div className="mt-4 text-sm text-red-500">Error: {error}</div>
        )}
        {success && (
          <div className="mt-4 text-sm text-green-500">
            Profile saved! Redirecting...
          </div>
        )}
      </section>
    </main>
  );
}
