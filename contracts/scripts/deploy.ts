import { ethers } from "hardhat";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function main() {
  const required = [
    "ENTRY_POINT",
    "EAS",
    "PROFILE_SCHEMA",
    "PREF_SCHEMA",
    "VERIFY_SCHEMA",
    "SAFETY_SCHEMA",
    "REPORT_SCHEMA",
    "PROFILE_WEIGHT",
    "ADDRESS_WEIGHT",
    "DEPOSIT_AMOUNT",
    "COOLDOWN",
    "TREASURY",
  ] as const;

  for (const key of required) {
    if (!process.env[key]) throw new Error(`Missing env var ${key}`);
  }

  const ENTRY_POINT = process.env.ENTRY_POINT as string;
  const EAS = process.env.EAS as string;
  const PROFILE_SCHEMA = process.env.PROFILE_SCHEMA as string;
  const PREF_SCHEMA = process.env.PREF_SCHEMA as string;
  const VERIFY_SCHEMA = process.env.VERIFY_SCHEMA as string;
  const SAFETY_SCHEMA = process.env.SAFETY_SCHEMA as string;
  const REPORT_SCHEMA = process.env.REPORT_SCHEMA as string;
  const PROFILE_WEIGHT = BigInt(process.env.PROFILE_WEIGHT as string);
  const ADDRESS_WEIGHT = BigInt(process.env.ADDRESS_WEIGHT as string);
  const DEPOSIT_AMOUNT = BigInt(process.env.DEPOSIT_AMOUNT as string);
  const COOLDOWN = BigInt(process.env.COOLDOWN as string);
  const TREASURY = process.env.TREASURY as string;

  // IdentityRegistry
  const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
  const identityRegistry = await IdentityRegistry.deploy(ENTRY_POINT);
  await identityRegistry.waitForDeployment();
  console.log("IdentityRegistry", await identityRegistry.getAddress());

  // ProfileManager
  const ProfileManager = await ethers.getContractFactory("ProfileManager");
  const profileManager = await ProfileManager.deploy(
    EAS,
    PROFILE_SCHEMA,
    PREF_SCHEMA,
    VERIFY_SCHEMA,
    SAFETY_SCHEMA
  );
  await profileManager.waitForDeployment();
  console.log("ProfileManager", await profileManager.getAddress());

  // MatchEngine
  const MatchEngine = await ethers.getContractFactory("MatchEngine");
  const matchEngine = await MatchEngine.deploy(
    await profileManager.getAddress(),
    { profileWeight: PROFILE_WEIGHT, addressWeight: ADDRESS_WEIGHT }
  );
  await matchEngine.waitForDeployment();
  console.log("MatchEngine", await matchEngine.getAddress());

  // IncentiveMechanism
  const IncentiveMechanism = await ethers.getContractFactory(
    "IncentiveMechanism"
  );
  const incentiveMechanism = await IncentiveMechanism.deploy(
    DEPOSIT_AMOUNT,
    COOLDOWN,
    TREASURY
  );
  await incentiveMechanism.waitForDeployment();
  console.log("IncentiveMechanism", await incentiveMechanism.getAddress());

  // SafetyReport
  const SafetyReport = await ethers.getContractFactory("SafetyReport");
  const safetyReport = await SafetyReport.deploy(EAS, REPORT_SCHEMA);
  await safetyReport.waitForDeployment();
  console.log("SafetyReport", await safetyReport.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
