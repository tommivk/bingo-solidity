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
    [accountA, accountB, accountC] = await ethers.getSigners();

    const VRFCoordinator = await ethers.getContractFactory(
      "MockVRFCoordinatorV2"
    );
    const vrfCoordinator = await VRFCoordinator.deploy();

    const contract = await ethers.getContractFactory("Bingo");
    bingo = await contract.deploy(
      accountA.address,
      ticketCost,
      maxPlayers,
      vrfCoordinator.address,
      0,
      ethers.constants.HashZero,
      {
        value: ticketCost,
      }
    );
  });

  it("Constructor should set correct data", async () => {
    const host = await bingo.host();
    const cost = (await bingo.getGame()).ticketCost;

    expect(host).to.equal(accountA.address);
    expect(cost).to.equal(ticketCost);
  });

  it("buyTicket should set a new bingo card with 25 unique numbers between 1 and 75", async () => {
    await bingo.buyTicket(accountB.address, { value: ticketCost });
    const bingoCard = (await bingo.getTicket(accountB.address)).card;
    const set = new Set();
    bingoCard.forEach((num: number) => {
      if (num > 0 && num <= 75) {
        set.add(num);
      }
    });
    expect(set.size).to.equal(25);
  });

  it("Should not be possible to buy two tickets", async () => {
    await bingo
      .connect(accountB)
      .buyTicket(accountB.address, { value: ticketCost });
    await expect(
      bingo.connect(accountB).buyTicket(accountB.address, { value: ticketCost })
    ).to.be.rejectedWith("This address already owns a ticket");
  });

  it("startGame should set game state to running and it should be callable only once", async () => {
    let gameState = await bingo.getGame();
    expect(gameState.gameStatus).to.equal(0);
    await bingo.startGame();
    gameState = await bingo.getGame();
    expect(gameState.gameStatus).to.equal(1);

    await expect(bingo.startGame()).to.be.rejectedWith(
      "The game has already started"
    );
  });

  it("Leaving the game should be possible in the setup phase and ticket cost should be refunded", async () => {
    await bingo
      .connect(accountB)
      .buyTicket(accountB.address, { value: ticketCost });

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

  it("claiming host should be possible when the host has left the game", async () => {
    await bingo
      .connect(accountB)
      .buyTicket(accountB.address, { value: ticketCost });
    await bingo.leaveGame();
    await bingo.connect(accountB).claimHost();
    expect(await bingo.host()).to.equal(accountB.address);
  });
});

describe("checkBingo tests", async () => {
  beforeEach(async () => {
    const VRFCoordinator = await ethers.getContractFactory(
      "MockVRFCoordinatorV2"
    );
    const vrfCoordinator = await VRFCoordinator.deploy();

    const Contract = await smock.mock<Bingo__factory>("Bingo");
    bingo = await Contract.deploy(
      accountA.address,
      ticketCost,
      maxPlayers,
      vrfCoordinator.address,
      0,
      ethers.constants.HashZero,
      {
        value: ticketCost,
      }
    );

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
    const VRFCoordinator = await ethers.getContractFactory(
      "MockVRFCoordinatorV2"
    );
    const vrfCoordinator = await VRFCoordinator.deploy();

    const Contract = await smock.mock<Bingo__factory>("Bingo");
    bingo = await Contract.deploy(
      accountA.address,
      ticketCost,
      maxPlayers,
      vrfCoordinator.address,
      0,
      ethers.constants.HashZero,
      {
        value: ticketCost,
      }
    );
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
    await bingo
      .connect(accountB)
      .buyTicket(accountB.address, { value: ticketCost });
    await bingo.startGame();
    await expect(bingo.connect(accountB).callBingo()).to.be.rejectedWith(
      "There was no bingo :("
    );

    const gameState = await bingo.getGame();

    expect(await bingo.winners(accountB.address)).to.equal(false);
    expect(gameState.winnerCount).to.equal(0);
    expect(gameState.bingoFoundTime).to.equal(0);
    expect(gameState.gameStatus).to.equal(1);
  });

  it("callbingo should make the correct state changes when winner calls it", async () => {
    await bingo
      .connect(accountB)
      .buyTicket(accountB.address, { value: ticketCost });
    await bingo.startGame();
    await setAllNumbersDrawn();

    const tx = await bingo.connect(accountB).callBingo();
    const blockNumber = (await tx.wait()).blockNumber;
    const txTime = (await ethers.provider.getBlock(blockNumber)).timestamp;

    const gameState = await bingo.getGame();

    expect(await bingo.winners(accountB.address)).to.equal(true);
    expect(await gameState.gameStatus).to.equal(2);
    expect(await gameState.winnerCount).to.equal(1);
    expect(await gameState.bingoFoundTime).to.equal(txTime);
  });

  it("Should not be possible to call callBingo twice with a winning card", async () => {
    await bingo
      .connect(accountB)
      .buyTicket(accountB.address, { value: ticketCost });
    await bingo.startGame();
    await setAllNumbersDrawn();

    await expect(bingo.connect(accountB).callBingo()).to.not.be.rejected;
    await expect(bingo.connect(accountB).callBingo()).to.be.rejectedWith(
      "You have already won"
    );
  });

  it("Second winner should be able to call bingo", async () => {
    await bingo
      .connect(accountB)
      .buyTicket(accountB.address, { value: ticketCost });
    await bingo
      .connect(accountC)
      .buyTicket(accountC.address, { value: ticketCost });
    await bingo.startGame();
    await setAllNumbersDrawn();
    await expect(bingo.connect(accountB).callBingo()).to.not.be.rejected;
    await expect(bingo.connect(accountC).callBingo()).to.not.be.rejected;

    const gameState = await bingo.getGame();

    expect(await gameState.winnerCount).to.equal(2);
    expect(await bingo.winners(accountB.address)).to.equal(true);
    expect(await bingo.winners(accountC.address)).to.equal(true);
  });

  it("Should not be possible to call callBingo after bingo call period has passed", async () => {
    await bingo
      .connect(accountB)
      .buyTicket(accountB.address, { value: ticketCost });
    await bingo
      .connect(accountC)
      .buyTicket(accountC.address, { value: ticketCost });
    await bingo.startGame();
    await setAllNumbersDrawn();
    await expect(bingo.connect(accountB).callBingo()).to.not.be.rejected;

    const gameState = await bingo.getGame();
    const bingoCallDeadline = await gameState.bingoCallPeriod;

    await time.increase(bingoCallDeadline);
    await expect(bingo.connect(accountC).callBingo()).to.be.rejectedWith(
      "Bingo call period has ended"
    );
  });
});

describe("Withdraw tests", () => {
  let bingoCallPeriod: number;

  beforeEach(async () => {
    const VRFCoordinator = await ethers.getContractFactory(
      "MockVRFCoordinatorV2"
    );
    const vrfCoordinator = await VRFCoordinator.deploy();

    const Contract = await smock.mock<Bingo__factory>("Bingo");
    bingo = await Contract.deploy(
      accountA.address,
      ticketCost,
      maxPlayers,
      vrfCoordinator.address,
      0,
      ethers.constants.HashZero,
      {
        value: ticketCost,
      }
    );
    bingoCallPeriod = (await bingo.getGame()).bingoCallPeriod;
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
    await bingo
      .connect(accountB)
      .buyTicket(accountB.address, { value: ticketCost });
    await bingo.startGame();
    await setAllNumbersDrawn();
    await bingo.connect(accountB).callBingo();
    await expect(bingo.connect(accountB).withdrawWinnings()).to.be.rejectedWith(
      "Withdraw period has not started yet"
    );
  });

  it("Should not be possible to withdraw without a winning ticket", async () => {
    await bingo
      .connect(accountB)
      .buyTicket(accountB.address, { value: ticketCost });
    await bingo.startGame();
    await setAllNumbersDrawn();
    await bingo.callBingo();

    await time.increase(bingoCallPeriod);
    await expect(bingo.connect(accountB).withdrawWinnings()).to.be.rejectedWith(
      "You are not a winner"
    );
  });

  it("Winner should be able to withdraw and balance should be increased correct amount", async () => {
    await bingo
      .connect(accountB)
      .buyTicket(accountB.address, { value: ticketCost });
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
    await bingo
      .connect(accountB)
      .buyTicket(accountB.address, { value: ticketCost });
    await bingo
      .connect(accountC)
      .buyTicket(accountC.address, { value: ticketCost });
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
    await bingo
      .connect(accountB)
      .buyTicket(accountB.address, { value: ticketCost });
    await bingo.startGame();
    await setAllNumbersDrawn();
    await bingo.connect(accountB).callBingo();

    await time.increase(bingoCallPeriod);

    await bingo.connect(accountB).withdrawWinnings();
    await expect(bingo.connect(accountB).withdrawWinnings()).to.be.rejectedWith(
      "You have already withdrawed"
    );
  });

  it("getWinners should return correct data", async () => {
    await bingo
      .connect(accountB)
      .buyTicket(accountB.address, { value: ticketCost });
    await bingo
      .connect(accountC)
      .buyTicket(accountC.address, { value: ticketCost });

    await bingo.startGame();
    await setAllNumbersDrawn();

    let winners = await bingo.getWinners();
    expect(winners.length).to.equal(0);

    await bingo.connect(accountA).callBingo();
    winners = await bingo.getWinners();
    expect(winners.length).to.equal(1);
    expect(winners).to.contain(accountA.address);

    await bingo.connect(accountB).callBingo();
    winners = await bingo.getWinners();
    expect(winners.length).to.equal(2);
    expect(winners).to.contain(accountA.address);
    expect(winners).to.contain(accountB.address);

    await bingo.connect(accountC).callBingo();
    winners = await bingo.getWinners();
    expect(winners.length).to.equal(3);
    expect(winners).to.contain(accountA.address);
    expect(winners).to.contain(accountB.address);
    expect(winners).to.contain(accountC.address);
  });
});
