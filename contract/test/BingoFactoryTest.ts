import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

let bingoFactory: Contract;
let contractAddress: string;
let accountA: SignerWithAddress;
let accountB: SignerWithAddress;

const gameFee = 20000;

describe("BingoFactory tests", () => {
  beforeEach(async () => {
    const VRFCoordinator = await ethers.getContractFactory(
      "MockVRFCoordinatorV2"
    );
    const vrfCoordinator = await VRFCoordinator.deploy();

    const contract = await ethers.getContractFactory("BingoFactory");
    [accountA, accountB] = await ethers.getSigners();
    bingoFactory = await contract.deploy(
      accountA.address,
      gameFee,
      vrfCoordinator.address,
      ethers.constants.AddressZero,
      ethers.constants.HashZero
    );
    contractAddress = bingoFactory.address;
  });

  it("Owner of the contract should be set correctly", async () => {
    const owner = await bingoFactory.owner();
    expect(owner).to.equal(accountA.address);
  });

  it("Only owner should be able to change owner", async () => {
    await expect(
      bingoFactory.connect(accountB).changeOwner(accountB.address)
    ).to.be.revertedWith("Only contract owner can call this function");
    await bingoFactory.changeOwner(accountB.address);
    expect(await bingoFactory.owner()).to.equal(accountB.address);
  });

  it("Sending ether to the contract should succeed", async () => {
    const oneEther = ethers.utils.parseEther("1");

    await accountB.sendTransaction({
      to: contractAddress,
      value: oneEther,
    });
    const balance = await ethers.provider.getBalance(contractAddress);
    expect(balance).to.equal(oneEther);
  });

  it("Owner should be able to withdraw contract funds", async () => {
    const oneEther = ethers.utils.parseEther("1");

    await accountB.sendTransaction({
      to: contractAddress,
      value: oneEther,
    });
    const balanceBefore = await ethers.provider.getBalance(accountA.address);
    const tx = await bingoFactory.withdraw();
    const balanceAfter = await ethers.provider.getBalance(accountA.address);

    const receipt = await tx.wait();
    const gasUsed =
      BigInt(receipt.cumulativeGasUsed) * BigInt(receipt.effectiveGasPrice);

    expect(balanceAfter.add(gasUsed).sub(balanceBefore)).to.equal(oneEther);
  });

  it("Only owner should be able to withdraw", async () => {
    await expect(bingoFactory.connect(accountB).withdraw()).to.be.rejectedWith(
      "Only contract owner can call this function"
    );
  });
});
