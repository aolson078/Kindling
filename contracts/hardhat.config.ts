import { config as dotenvConfig } from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@typechain/hardhat";

dotenvConfig();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.26",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  paths: {
    sources: "src",
    artifacts: "artifacts",
    cache: "cache",
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
  networks: {
    hardhat: {},
    // Uncomment and set RPC URLs/private keys as needed
    // sepolia: {
    //   url: process.env.SEPOLIA_RPC_URL || "",
    //   accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    // }
  },
};

export default config;
