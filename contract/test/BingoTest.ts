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

describe("Call Bingo tests", () => {
  beforeEach(async () => {
    const Contract = await smock.mock<Bingo__factory>("Bingo");
    bingo = await Contract.deploy(ticketCost, maxPlayers, {
      value: ticketCost,
    });
    [accountA, accountB, accountC] = await ethers.getSigners();
  });

  it("callBingo should reject when the game has not been started", async () => {
    await expect(bingo.callBingo()).to.be.rejectedWith(
      "The game has not started yet"
    );
  });

  it("callBingo should reject if the caller does not have a ticket", async () => {
    await bingo.startGame();
    await expect(bingo.connect(accountB).callBingo()).to.be.rejectedWith(
      "You don't have a valid ticket"
    );
  });

  it("callBingo should not make state changes when there is no bingo", async () => {
    await bingo.connect(accountB).buyTicket({ value: ticketCost });
    await bingo.startGame();
    await expect(bingo.connect(accountB).callBingo()).to.be.rejectedWith(
      "There was no bingo :("
    );

    expect(await bingo.winners(accountB.address)).to.equal(false);
    expect(await bingo.winnerCount()).to.equal(0);
    expect(await bingo.bingoFoundTime()).to.equal(0);
    expect(await bingo.gameState()).to.equal(1);
  });

  it("callbingo should make the correct state changes when winner calls it", async () => {
    await bingo.connect(accountB).buyTicket({ value: ticketCost });
    await bingo.startGame();
    await setAllNumbersDrawn();

    const tx = await bingo.connect(accountB).callBingo();
    const blockNumber = (await tx.wait()).blockNumber;
    const txTime = (await ethers.provider.getBlock(blockNumber)).timestamp;

    expect(await bingo.winners(accountB.address)).to.equal(true);
    expect(await bingo.gameState()).to.equal(2);
    expect(await bingo.winnerCount()).to.equal(1);
    expect(await bingo.bingoFoundTime()).to.equal(txTime);
  });

  it("Should not be possible to call callBingo twice with a winning card", async () => {
    await bingo.connect(accountB).buyTicket({ value: ticketCost });
    await bingo.startGame();
    await setAllNumbersDrawn();

    await expect(bingo.connect(accountB).callBingo()).to.not.be.rejected;
    await expect(bingo.connect(accountB).callBingo()).to.be.rejectedWith(
      "You have already won"
    );
  });

  it("Second winner should be able to call bingo", async () => {
    await bingo.connect(accountB).buyTicket({ value: ticketCost });
    await bingo.connect(accountC).buyTicket({ value: ticketCost });
    await bingo.startGame();
    await setAllNumbersDrawn();
    await expect(bingo.connect(accountB).callBingo()).to.not.be.rejected;
    await expect(bingo.connect(accountC).callBingo()).to.not.be.rejected;

    expect(await bingo.winnerCount()).to.equal(2);
    expect(await bingo.winners(accountB.address)).to.equal(true);
    expect(await bingo.winners(accountC.address)).to.equal(true);
  });

  it("Should not be possible to call callBingo after bingo call period has passed", async () => {
    await bingo.connect(accountB).buyTicket({ value: ticketCost });
    await bingo.connect(accountC).buyTicket({ value: ticketCost });
    await bingo.startGame();
    await setAllNumbersDrawn();
    await expect(bingo.connect(accountB).callBingo()).to.not.be.rejected;
    const bingoCallDeadline = await bingo.bingoCallPeriod();

    await time.increase(bingoCallDeadline);
    await expect(bingo.connect(accountC).callBingo()).to.be.rejectedWith(
      "Bingo call period has ended"
    );
  });
});

describe("Withdraw tests", () => {
  let bingoCallPeriod: number;

  beforeEach(async () => {
    const Contract = await smock.mock<Bingo__factory>("Bingo");
    bingo = await Contract.deploy(ticketCost, maxPlayers, {
      value: ticketCost,
    });
    bingoCallPeriod = await bingo.bingoCallPeriod();
    [accountA, accountB, accountC] = await ethers.getSigners();
  });

  const getBalanceIncrease = async (
    account: SignerWithAddress,
    fun: () => any
  ) => {
    const balanceBefore = await ethers.provider.getBalance(account.address);
    const tx = await fun();
    const receipt = await tx.wait();
    const gasUsed = receipt.cumulativeGasUsed.mul(receipt.effectiveGasPrice);
    const balanceAfter = await ethers.provider.getBalance(account.address);
    return balanceAfter.add(gasUsed).sub(balanceBefore);
  };

  it("Should not be possible to withdraw before the game has ended", async () => {
    await expect(bingo.connect(accountB).withdrawWinnings()).to.be.rejectedWith(
      "The game has not ended yet"
    );
  });

  it("Should not be possible to withdraw before bingo call period has ended", async () => {
    await bingo.connect(accountB).buyTicket({ value: ticketCost });
    await bingo.startGame();
    await setAllNumbersDrawn();
    await bingo.connect(accountB).callBingo();
    await expect(bingo.connect(accountB).withdrawWinnings()).to.be.rejectedWith(
      "Withdraw period has not started yet"
    );
  });

  it("Should not be possible to withdraw without a winning ticket", async () => {
    await bingo.connect(accountB).buyTicket({ value: ticketCost });
    await bingo.startGame();
    await setAllNumbersDrawn();
    await bingo.callBingo();

    await time.increase(bingoCallPeriod);
    await expect(bingo.connect(accountB).withdrawWinnings()).to.be.rejectedWith(
      "You are not a winner"
    );
  });

  it("Winner should be able to withdraw and balance should be increased correct amount", async () => {
    await bingo.connect(accountB).buyTicket({ value: ticketCost });
    await bingo.startGame();
    await setAllNumbersDrawn();
    await bingo.connect(accountB).callBingo();

    await time.increase(bingoCallPeriod);

    const balanceIncrease = await getBalanceIncrease(
      accountB,
      bingo.connect(accountB).withdrawWinnings
    );

    expect(balanceIncrease).to.equal(ticketCost * 2);
  });

  it("Multiple winners should be able to withdraw and balances should be increased correctly", async () => {
    await bingo.connect(accountB).buyTicket({ value: ticketCost });
    await bingo.connect(accountC).buyTicket({ value: ticketCost });
    await bingo.startGame();
    await setAllNumbersDrawn();

    await bingo.callBingo();
    await bingo.connect(accountB).callBingo();
    await bingo.connect(accountC).callBingo();

    await time.increase(bingoCallPeriod);

    const increaseA = await getBalanceIncrease(
      accountA,
      bingo.withdrawWinnings
    );
    const increaseB = await getBalanceIncrease(
      accountB,
      bingo.connect(accountB).withdrawWinnings
    );
    const increaseC = await getBalanceIncrease(
      accountC,
      bingo.connect(accountC).withdrawWinnings
    );
    expect(increaseA).to.equal(ticketCost);
    expect(increaseB).to.equal(ticketCost);
    expect(increaseC).to.equal(ticketCost);
  });

  it("Winner should not be able to withdraw twice", async () => {
    await bingo.connect(accountB).buyTicket({ value: ticketCost });
    await bingo.startGame();
    await setAllNumbersDrawn();
    await bingo.connect(accountB).callBingo();

    await time.increase(bingoCallPeriod);

    await bingo.connect(accountB).withdrawWinnings();
    await expect(bingo.connect(accountB).withdrawWinnings()).to.be.rejectedWith(
      "You have already withdrawed"
    );
  });
});
