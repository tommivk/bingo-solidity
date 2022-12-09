import { artifacts } from "hardhat";
const path = require("path");

const updateFrontendAbi = async () => {
  const fs = require("fs");
  const contractsDir = path.join(__dirname, "..", "..", "frontend", "abi");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  const BingoFactory = artifacts.readArtifactSync("BingoFactory");
  const bingoFactoryAbi = `export const abi = ${JSON.stringify(
    BingoFactory.abi,
    null,
    2
  )} as const`;
  fs.writeFileSync(path.join(contractsDir, "BingoFactory.ts"), bingoFactoryAbi);

  const Bingo = artifacts.readArtifactSync("Bingo");
  const bingoAbi = `export const abi = ${JSON.stringify(
    Bingo.abi,
    null,
    2
  )} as const`;
  fs.writeFileSync(path.join(contractsDir, "Bingo.ts"), bingoAbi);

  console.log("Abi updated");
};

updateFrontendAbi().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
