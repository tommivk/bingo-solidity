import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { smock, MockContract } from "@defi-wonderland/smock";
import { Bingo, Bingo__factory } from "../typechain-types";
import { time } from "@nomicfoundation/hardhat-network-helpers";

const ticketCost = 200;
const maxPlayers = 3;

let accountA: SignerWithAddress;
let accountB: SignerWithAddress;
let accountC: SignerWithAddress;

let bingo: Contract | MockContract<Bingo>;

const setAllNumbersDrawn = async () => {
  const allNumbers: Record<number, boolean> = {};
  [...Array(76).keys()].slice(1).map((num) => (allNumbers[num] = true));
  await bingo.setVariables({
    numbersDrawn: allNumbers,
  });
};

describe("Bingo", function () {
  beforeEach(async () => {
    const contract = await ethers.getContractFactory("Bingo");
    bingo = await contract.deploy(ticketCost, maxPlayers, {
      value: ticketCost,
    });

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

  it("Should not be possible to buy two tickets", async () => {
    await bingo.connect(accountB).buyTicket({ value: ticketCost });
    await expect(
      bingo.connect(accountB).buyTicket({ value: ticketCost })
    ).to.be.rejectedWith("You already own a ticket");
  });

  it("startGame should set game state to running and it should be callable only once", async () => {
    let gameState = await bingo.gameState();
    expect(gameState).to.equal(0);
    await bingo.startGame();
    gameState = await bingo.gameState();
    expect(gameState).to.equal(1);

    await expect(bingo.startGame()).to.be.rejectedWith(
      "The game has already started"
    );
  });

  it("Leaving the game should be possible in the setup phase and ticket cost should be refunded", async () => {
    await bingo.connect(accountB).buyTicket({ value: ticketCost });

    const balanceBefore = await ethers.provider.getBalance(accountB.address);
    const tx = await bingo.connect(accountB).leaveGame();

    const receipt = await tx.wait();
    const gasUsed =
      BigInt(receipt.cumulativeGasUsed) * BigInt(receipt.effectiveGasPrice);
    const balanceAfter = await ethers.provider.getBalance(accountB.address);

    expect(
      balanceBefore.sub(balanceAfter.add(gasUsed)).add(ticketCost)
    ).to.equal(0);

    const ticket = await bingo.addressToTicket(accountB.address);
    expect(ticket.valid).to.equal(false);
  });

  it("Leaving the game should not be possible after the game has started", async () => {
    await bingo.startGame();
    await expect(bingo.connect(accountB).leaveGame()).to.be.rejectedWith(
      "The game has already started"
    );
  });

  it("Leaving the game should not be possible when ticket has not been bought", async () => {
    await expect(bingo.connect(accountB).leaveGame()).to.be.rejectedWith(
      "You are not a player"
    );
  });

  it("claimHost should reject when called in the setup phase", async () => {
    await expect(
      bingo.connect(accountB).claimHost()
    ).to.be.revertedWithoutReason();
  });

  it("claimHost should reject when the game is running but the host has not timed out", async () => {
    await bingo.startGame();
    await expect(
      bingo.connect(accountB).claimHost()
    ).to.be.revertedWithoutReason();
  });

  it("claiming host should be possible when the host has timed out and hosts ticket should be invalidated", async () => {
    await bingo.startGame();
    await time.increase(200);
    await bingo.connect(accountB).claimHost();
    expect(await bingo.host()).to.equal(accountB.address);

    const ticket = await bingo.addressToTicket(accountA.address);
    expect(ticket.valid).to.equal(false);
  });

  it("claiming host should be possible when the host has left the game", async () => {
    await bingo.leaveGame();
    await bingo.connect(accountB).claimHost();
    expect(await bingo.host()).to.equal(accountB.address);
  });
});

describe("checkBingo tests", async () => {
  beforeEach(async () => {
    const Contract = await smock.mock<Bingo__factory>("Bingo");
    bingo = await Contract.deploy(ticketCost, maxPlayers, {
      value: ticketCost,
    });

    [accountA, accountB, accountC] = await ethers.getSigners();

    // Set numbers 1-5 as drawn
    await bingo.setVariables({
      numbersDrawn: {
        1: true,
        2: true,
        3: true,
        4: true,
        5: true,
      },
    });
  });

  it("checkBingo should return false with bingo card filled with zeroes", async () => {
    const card = new Array(25).fill(0);
    const result = await bingo.checkBingo(card);
    expect(result).to.equal(false);
  });

  it("checkBingo should return true when there is a horizontal bingo", async () => {
    const numbers = [1, 2, 3, 4, 5];

    let card = [...numbers, ...Array(20).fill(0)];
    expect(await bingo.checkBingo(card)).to.equal(true);

    card = [...Array(5).fill(0), ...numbers, ...Array(15).fill(0)];
    expect(await bingo.checkBingo(card)).to.equal(true);

    card = [...Array(10).fill(0), ...numbers, ...Array(10).fill(0)];
    expect(await bingo.checkBingo(card)).to.equal(true);

    card = [...Array(15).fill(0), ...numbers, ...Array(5).fill(0)];
    expect(await bingo.checkBingo(card)).to.equal(true);

    card = [...Array(20).fill(0), ...numbers];
    expect(await bingo.checkBingo(card)).to.equal(true);
  });

  it("checkBingo should return true when there is a diagonal bingo", async () => {
    let card = new Array(25).fill(0);
    card[0] = 1;
    card[6] = 2;
    card[18] = 4;
    card[24] = 5;
    expect(await bingo.checkBingo(card)).to.equal(true);

    card = new Array(25).fill(0);
    card[4] = 1;
    card[8] = 2;
    card[16] = 4;
    card[20] = 5;
    expect(await bingo.checkBingo(card)).to.equal(true);
  });

  it("checkBingo should return true when there is a vertical bingo", async () => {
    for (let i = 0; i < 5; i++) {
      let card = new Array(25).fill(0);

      for (let j = 0; j < 5; j++) {
        let columnIndex = 5 * j + i;
        card[columnIndex] = j + 1;
      }

      const res = await bingo.checkBingo(card);
      expect(res).to.equal(true);
    }
  });

  it("checkBingo should return false with random non-winning bingo cards", async () => {
    for (let i = 0; i < 50; i++) {
      let card = [...Array(76).keys()];
      card.splice(0, 3);
      card.sort(() => 0.5 - Math.random());
      card = card.slice(0, 25);
      expect(await bingo.checkBingo(card)).to.equal(false);
    }
  });
});
