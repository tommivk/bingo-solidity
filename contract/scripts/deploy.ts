import { ethers } from "hardhat";

async function main() {
  const Bingo = await ethers.getContractFactory("Bingo");
  const bingo = await Bingo.deploy();

  await bingo.deployed();

  console.log(`Contract deployed to ${bingo.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
