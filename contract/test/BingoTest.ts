import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const ticketCost = 200;

let accountA: SignerWithAddress;
let accountB: SignerWithAddress;
let accountC: SignerWithAddress;

describe("Bingo", function () {
  let bingo: Contract;

  beforeEach(async () => {
    const Bingo = await ethers.getContractFactory("Bingo");
    bingo = await Bingo.deploy(ticketCost, { value: ticketCost });

    [accountA, accountB, accountC] = await ethers.getSigners();
  });

  it("Constructor should set correct data", async () => {
    const host = await bingo.host();
    const cost = await bingo.ticketCost();

    expect(host).to.equal(accountA.address);
    expect(cost).to.equal(ticketCost);
  });

  it("getNumbers should return numbers from 1 to 75", async () => {
    const numbers = await bingo.getNumbers();
    for (let i = 0; i < 75; i++) {
      expect(numbers[i]).to.equal(i + 1);
    }
  });

  it("buyTicket should set a new bingo card with 25 unique numbers between 1 and 75", async () => {
    await bingo.connect(accountB).buyTicket({ value: ticketCost });
    const ticket = await bingo.connect(accountB).getTicket();
    const set = new Set();
    ticket.forEach((num: number) => {
      if (num > 0 && num <= 75) {
        set.add(num);
      }
    });
    expect(set.size).to.equal(25);
  });
});
