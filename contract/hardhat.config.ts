import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import * as dotenv from "dotenv";

dotenv.config();

const ALCHEMY_GOERLI_API_URL = process.env.ALCHEMY_GOERLI_API_URL ?? "";
const PRIVATE_KEY = process.env.PRIVATE_KEY ?? "";
const ALCHEMY_MUMBAI_API_URL = process.env.ALCHEMY_MUMBAI_API_URL ?? "";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          outputSelection: {
            "*": {
              "*": ["storageLayout"],
            },
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    goerli: {
      url: ALCHEMY_GOERLI_API_URL,
      accounts: [PRIVATE_KEY],
      gasPrice: 4000000000,
    },
    mumbai: {
      url: ALCHEMY_MUMBAI_API_URL,
      accounts: [PRIVATE_KEY],
    },
  },
};

export default config;
