"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useAccount, useWriteContract } from "wagmi";
import {
  buildRendezvousWitness,
  deriveLocationCommitment,
  deriveNullifierHash,
  deriveSessionId,
  deriveTimeSlot,
  hashToField,
} from "@/lib/zk/rendezvous";

const receiptAbi = [
  {
    type: "function",
    name: "submitReceipt",
    stateMutability: "nonpayable",
    inputs: [
      { name: "counterpart", type: "address" },
      { name: "sessionId", type: "bytes32" },
      { name: "locationCommitment", type: "bytes32" },
      { name: "timeSlot", type: "uint256" },
      { name: "memo", type: "string" },
      { name: "merkleRoot", type: "uint256" },
      { name: "nullifierHash", type: "uint256" },
      { name: "proof", type: "uint256[8]" },
    ],
    outputs: [{ name: "uid", type: "bytes32" }],
  },
] as const;

const receiptAddress =
  process.env.NEXT_PUBLIC_RENDEZVOUS_RECEIPT_ADDRESS as `0x${string}` | undefined;

type FormState = {
  attendee: string;
  counterpart: string;
  mySecret: string;
  counterpartSecret: string;
  timestamp: string;
  latitude: string;
  longitude: string;
  accuracy: string;
  memo: string;
};

const defaultTimestamp = new Date().toISOString().slice(0, 16);

function formatHex(value?: string) {
  if (!value) return "";
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

export default function RendezvousPage() {
  const { address } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();

  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    attendee: "",
    counterpart: "",
    mySecret: "",
    counterpartSecret: "",
    timestamp: defaultTimestamp,
    latitude: "37.7749",
    longitude: "-122.4194",
    accuracy: "25",
    memo: "Coffee in the Mission",
  });

  useEffect(() => {
    if (address && !form.attendee) {
      setForm((prev) => ({ ...prev, attendee: address }));
    }
  }, [address, form.attendee]);

  const timeSlot = useMemo(() => {
    try {
      return deriveTimeSlot(form.timestamp);
    } catch (error) {
      console.error("deriveTimeSlot", error);
      return undefined;
    }
  }, [form.timestamp]);

  const sessionId = useMemo(() => {
    if (!form.mySecret || !form.counterpartSecret) return undefined;
    return deriveSessionId({
      selfSecret: form.mySecret,
      counterpartSecret: form.counterpartSecret,
    });
  }, [form.mySecret, form.counterpartSecret]);

  const locationCommitment = useMemo(() => {
    if (!timeSlot) return undefined;
    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return undefined;
    }
    const accuracy = Number(form.accuracy);
    return deriveLocationCommitment(
      {
        latitude,
        longitude,
        accuracyMeters: Number.isFinite(accuracy) ? accuracy : undefined,
      },
      timeSlot
    );
  }, [form.latitude, form.longitude, form.accuracy, timeSlot]);

  const nullifierHash = useMemo(() => {
    if (!sessionId || !form.mySecret) return undefined;
    return deriveNullifierHash(sessionId, form.mySecret);
  }, [sessionId, form.mySecret]);

  const merkleRoot = useMemo(() => {
    if (!sessionId) return undefined;
    return hashToField(sessionId);
  }, [sessionId]);

  const attendee = form.attendee.startsWith("0x")
    ? (form.attendee as `0x${string}`)
    : undefined;
  const counterpart = form.counterpart.startsWith("0x")
    ? (form.counterpart as `0x${string}`)
    : undefined;

  const witness = useMemo(() => {
    if (
      !attendee ||
      !counterpart ||
      !sessionId ||
      !locationCommitment ||
      !timeSlot ||
      nullifierHash === undefined ||
      merkleRoot === undefined
    ) {
      return undefined;
    }
    try {
      return buildRendezvousWitness({
        attendee,
        counterpart,
        sessionId,
        locationCommitment,
        timeSlot,
        merkleRoot,
        nullifierHash,
      });
    } catch (error) {
      console.error("build witness", error);
      return undefined;
    }
  }, [
    attendee,
    counterpart,
    sessionId,
    locationCommitment,
    timeSlot,
    nullifierHash,
    merkleRoot,
  ]);

  const canSubmit =
    Boolean(receiptAddress) &&
    Boolean(witness) &&
    Boolean(form.memo) &&
    counterpart?.startsWith("0x") &&
    attendee?.startsWith("0x");

  const derivedValues = useMemo(() => {
    if (!witness || !sessionId || !locationCommitment || !timeSlot) {
      return null;
    }
    return {
      sessionId,
      locationCommitment,
      timeSlot,
      nullifierHash,
      merkleRoot,
      signal: witness.signal,
      externalNullifier: witness.externalNullifier,
    };
  }, [witness, sessionId, locationCommitment, timeSlot, nullifierHash, merkleRoot]);

  const handleChange = (field: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setTxHash(null);

    if (!canSubmit || !witness || !receiptAddress || !counterpart || !attendee) {
      setErrorMessage("Missing rendezvous parameters");
      return;
    }

    try {
      const hash = await writeContractAsync({
        abi: receiptAbi,
        address: receiptAddress,
        functionName: "submitReceipt",
        args: [
          counterpart,
          sessionId!,
          locationCommitment!,
          timeSlot!,
          form.memo,
          witness.merkleRoot,
          witness.nullifierHash,
          witness.proof,
        ],
      });
      setTxHash(hash);
    } catch (error) {
      console.error("submitReceipt", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to submit receipt"
      );
    }
  };

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-12">
      <header className="space-y-2">
        <span className="badge">Zero knowledge rendezvous</span>
        <h1 className="heading-serif text-4xl font-semibold">
          Submit a rendezvous receipt
        </h1>
        <p className="text-muted">
          Exchange Bluetooth secrets, derive a shared session, and anchor your
          meetup with a Semaphore-style proof. Positive reputation adjustments
          only land when this receipt verifies on-chain.
        </p>
        {!receiptAddress && (
          <p className="rounded-md border border-red-500/60 bg-red-500/10 p-3 text-sm text-red-300">
            Set NEXT_PUBLIC_RENDEZVOUS_RECEIPT_ADDRESS to enable on-chain
            submissions. The interface will still derive the witness for dry
            runs.
          </p>
        )}
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 rounded-2xl border border-white/10 bg-surface/40 p-6 backdrop-blur"
      >
        <section className="grid gap-4">
          <h2 className="text-lg font-medium">1. Exchange commitments</h2>
          <p className="text-sm text-muted">
            Swap one-time secrets over Bluetooth or NFC. Both parties should
            enter the same pair here to derive an identical session identifier
            and nullifier hash.
          </p>
          <label className="grid gap-1 text-sm">
            <span>Your connected address</span>
            <input
              value={form.attendee}
              onChange={handleChange("attendee")}
              placeholder="0x..."
              className="rounded-md border border-white/10 bg-black/40 px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>Counterpart address</span>
            <input
              value={form.counterpart}
              onChange={handleChange("counterpart")}
              placeholder="0x..."
              className="rounded-md border border-white/10 bg-black/40 px-3 py-2"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span>Your secret</span>
              <input
                value={form.mySecret}
                onChange={handleChange("mySecret")}
                placeholder="e.g. blossom-moon"
                className="rounded-md border border-white/10 bg-black/40 px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span>Counterpart secret</span>
              <input
                value={form.counterpartSecret}
                onChange={handleChange("counterpartSecret")}
                placeholder="shared over Bluetooth"
                className="rounded-md border border-white/10 bg-black/40 px-3 py-2"
              />
            </label>
          </div>
        </section>

        <section className="grid gap-4">
          <h2 className="text-lg font-medium">2. Location &amp; schedule</h2>
          <p className="text-sm text-muted">
            Round the rendezvous time to five-minute slots and quantize the
            coordinates. These values remain private thanks to the proof, while
            the contract only receives hashed commitments.
          </p>
          <label className="grid gap-1 text-sm">
            <span>Time (local)</span>
            <input
              type="datetime-local"
              value={form.timestamp}
              onChange={handleChange("timestamp")}
              className="rounded-md border border-white/10 bg-black/40 px-3 py-2"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="grid gap-1 text-sm">
              <span>Latitude</span>
              <input
                value={form.latitude}
                onChange={handleChange("latitude")}
                className="rounded-md border border-white/10 bg-black/40 px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span>Longitude</span>
              <input
                value={form.longitude}
                onChange={handleChange("longitude")}
                className="rounded-md border border-white/10 bg-black/40 px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span>Accuracy (m)</span>
              <input
                value={form.accuracy}
                onChange={handleChange("accuracy")}
                className="rounded-md border border-white/10 bg-black/40 px-3 py-2"
              />
            </label>
          </div>
          <label className="grid gap-1 text-sm">
            <span>Memo (stored in attestation)</span>
            <textarea
              value={form.memo}
              onChange={handleChange("memo")}
              rows={2}
              className="rounded-md border border-white/10 bg-black/40 px-3 py-2"
            />
          </label>
        </section>

        <section className="grid gap-4">
          <h2 className="text-lg font-medium">3. Derived witness</h2>
          <p className="text-sm text-muted">
            Share the session identifier with your counterpart so they can
            verify the same proof off-chain. The proof inputs below feed directly
            into the RendezvousReceipt contract.
          </p>
          {derivedValues ? (
            <div className="grid gap-2 text-sm">
              <div>
                <span className="text-muted">Session ID</span>
                <div className="font-mono text-xs">{derivedValues.sessionId}</div>
              </div>
              <div>
                <span className="text-muted">Location commitment</span>
                <div className="font-mono text-xs">
                  {derivedValues.locationCommitment}
                </div>
              </div>
              <div className="grid gap-1 sm:grid-cols-3">
                <div>
                  <span className="text-muted">Time slot</span>
                  <div className="font-mono text-xs">
                    {derivedValues.timeSlot.toString()}
                  </div>
                </div>
                <div>
                  <span className="text-muted">Nullifier</span>
                  <div className="font-mono text-xs">
                    {derivedValues.nullifierHash?.toString()}
                  </div>
                </div>
                <div>
                  <span className="text-muted">Merkle root</span>
                  <div className="font-mono text-xs">
                    {derivedValues.merkleRoot?.toString()}
                  </div>
                </div>
              </div>
              <div className="grid gap-1 sm:grid-cols-2">
                <div>
                  <span className="text-muted">Signal</span>
                  <div className="font-mono text-xs">
                    {derivedValues.signal.toString()}
                  </div>
                </div>
                <div>
                  <span className="text-muted">External nullifier</span>
                  <div className="font-mono text-xs">
                    {derivedValues.externalNullifier.toString()}
                  </div>
                </div>
              </div>
              {txHash && (
                <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-emerald-200">
                  Submitted transaction {formatHex(txHash)}
                </div>
              )}
              {errorMessage && (
                <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-red-300">
                  {errorMessage}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted">
              Fill out the fields above to generate a witness preview.
            </p>
          )}
        </section>

        <button
          type="submit"
          disabled={!canSubmit || isPending}
          className="btn-primary disabled:opacity-50"
        >
          {isPending ? "Submitting…" : "Submit rendezvous receipt"}
        </button>
      </form>

      {witness && (
        <aside className="grid gap-2 rounded-2xl border border-white/5 bg-black/30 p-4 text-xs text-muted">
          <h3 className="text-sm font-semibold text-white">Debug witness</h3>
          <p>
            Share these numbers with the counterparty to cross-check the proof
            before final submission.
          </p>
          <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[11px]">
{`signal: ${witness.signal.toString()}
externalNullifier: ${witness.externalNullifier.toString()}
proof: [${witness.proof.map((v) => v.toString()).join(", ")}]
`}
          </pre>
        </aside>
      )}

      <section className="grid gap-2 rounded-2xl border border-white/5 bg-black/30 p-4 text-sm text-muted">
        <h3 className="text-base font-semibold text-white">How it flows</h3>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Each partner exchanges short-lived Bluetooth or QR secrets.</li>
          <li>
            The UI hashes those into a shared session identifier and Semaphore
            nullifier.
          </li>
          <li>
            Location, time, and memo are reduced to field elements and included
            as the proof signal.
          </li>
          <li>
            The witness above feeds <code>submitReceipt</code>, minting an EAS
            attestation whose UID unlocks positive safety reports.
          </li>
        </ol>
      </section>
    </main>
  );
}
