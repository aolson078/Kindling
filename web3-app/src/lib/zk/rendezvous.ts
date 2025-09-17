import {
  keccak256,
  solidityPackedKeccak256,
  toHex,
  type Hex,
} from "viem";

export const SNARK_SCALAR_FIELD =
  21888242871839275222246405745257275088548364400416034343698204186575808495617n;

export function hashToField(value: Hex | string): bigint {
  const hexValue = typeof value === "string" && value.startsWith("0x")
    ? (value as Hex)
    : toHex(value);
  const digest = keccak256(hexValue);
  return BigInt(digest) % SNARK_SCALAR_FIELD;
}

export type RendezvousSecrets = {
  selfSecret: string;
  counterpartSecret: string;
};

export type LocationCommitmentInput = {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
};

export type RendezvousWitnessParams = {
  attendee: `0x${string}`;
  counterpart: `0x${string}`;
  sessionId: Hex;
  locationCommitment: Hex;
  timeSlot: bigint;
  merkleRoot: bigint;
  nullifierHash: bigint;
};

export type RendezvousWitness = {
  merkleRoot: bigint;
  nullifierHash: bigint;
  signal: bigint;
  externalNullifier: bigint;
  proof: readonly [
    bigint,
    bigint,
    bigint,
    bigint,
    bigint,
    bigint,
    bigint,
    bigint
  ];
};

export function deriveSessionId({
  selfSecret,
  counterpartSecret,
}: RendezvousSecrets): Hex {
  const [a, b] = [selfSecret, counterpartSecret].sort();
  const payload = `${a}|${b}`;
  return keccak256(toHex(payload));
}

export function deriveTimeSlot(
  timestamp: Date | string,
  intervalSeconds = 300
): bigint {
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  const secondsFloat = date.getTime() / 1000;
  if (!Number.isFinite(secondsFloat)) {
    throw new Error("Invalid timestamp for rendezvous time slot");
  }
  const seconds = Math.floor(secondsFloat);
  return BigInt(Math.floor(seconds / intervalSeconds));
}

export function deriveLocationCommitment(
  { latitude, longitude, accuracyMeters }: LocationCommitmentInput,
  timeSlot: bigint
): Hex {
  const payload = `${latitude.toFixed(6)}:${longitude.toFixed(6)}:${
    accuracyMeters ?? 0
  }:${timeSlot.toString()}`;
  return keccak256(toHex(payload));
}

export function computeSignal({
  attendee,
  counterpart,
  sessionId,
  locationCommitment,
  timeSlot,
}: Omit<RendezvousWitnessParams, "merkleRoot" | "nullifierHash">): bigint {
  const digest = solidityPackedKeccak256(
    ["string", "address", "address", "bytes32", "bytes32", "uint256"],
    [
      "kindling:rendezvous:signal",
      attendee,
      counterpart,
      sessionId,
      locationCommitment,
      timeSlot,
    ]
  );
  return BigInt(digest) % SNARK_SCALAR_FIELD;
}

export function computeExternalNullifier(
  sessionId: Hex,
  timeSlot: bigint
): bigint {
  const digest = solidityPackedKeccak256(
    ["string", "bytes32", "uint256"],
    ["kindling:rendezvous:external", sessionId, timeSlot]
  );
  return BigInt(digest) % SNARK_SCALAR_FIELD;
}

export function deriveNullifierHash(
  sessionId: Hex,
  secret: string,
  salt = "kindling"
): bigint {
  const digest = solidityPackedKeccak256(
    ["string", "bytes32", "string"],
    ["kindling:rendezvous:nullifier", sessionId, `${secret}|${salt}`]
  );
  return BigInt(digest) % SNARK_SCALAR_FIELD;
}

export function buildRendezvousWitness(
  params: RendezvousWitnessParams
): RendezvousWitness {
  const signal = computeSignal(params);
  const externalNullifier = computeExternalNullifier(
    params.sessionId,
    params.timeSlot
  );

  const proof: RendezvousWitness["proof"] = [
    signal,
    externalNullifier,
    0n,
    0n,
    0n,
    0n,
    0n,
    0n,
  ];

  return {
    merkleRoot: params.merkleRoot,
    nullifierHash: params.nullifierHash,
    signal,
    externalNullifier,
    proof,
  };
}
