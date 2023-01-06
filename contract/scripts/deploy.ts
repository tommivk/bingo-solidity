import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  const BingoFactory = await ethers.getContractFactory("BingoFactory");
  const bingoFactory = await BingoFactory.deploy(deployer.address, {
    gasLimit: 9000000,
  });

  await bingoFactory.deployed();

  console.log(`Contract deployed to ${bingoFactory.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
