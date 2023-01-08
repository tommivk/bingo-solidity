import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  // ** Mumbai network **
  const vrfCoordinator = "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed";
  const linkTokenContract = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB";
  // The gas lane to use, which specifies the maximum gas price to bump to
  const keyHash =
    "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f";

  const BingoFactory = await ethers.getContractFactory("BingoFactory");
  const bingoFactory = await BingoFactory.deploy(
    deployer.address,
    vrfCoordinator,
    linkTokenContract,
    keyHash,
    {
      gasLimit: 9000000,
    }
  );

  await bingoFactory.deployed();

  console.log(`Contract deployed to ${bingoFactory.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
