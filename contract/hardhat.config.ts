import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import * as dotenv from "dotenv";

dotenv.config();

const ALCHEMY_GOERLI_API_URL = process.env.ALCHEMY_GOERLI_API_URL ?? "";
const PRIVATE_KEY = process.env.PRIVATE_KEY ?? "";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
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
      mining: {
        interval: 5000,
      },
    },
    goerli: {
      url: ALCHEMY_GOERLI_API_URL,
      accounts: [PRIVATE_KEY],
      gasPrice: 4000000000,
    },
  },
};

export default config;
