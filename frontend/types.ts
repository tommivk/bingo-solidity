import { BigNumber } from "ethers";
import { Address } from "wagmi";
import { narrow } from "abitype";
import { abi as BingoAbi } from "./abi/Bingo";
import { abi as BingoFactoryAbi } from "./abi/BingoFactory";

export type GameState = {
  ticketCost: BigNumber;
  minPlayers: number;
  maxPlayers: number;
  totalNumbersDrawn: number;
  bingoCallPeriod: number;
  winnerCount: number;
  bingoFoundTime: BigNumber;
  gameStatus: number;
  joinedPlayers: readonly Address[];
};

export type Ticket = {
  valid: boolean;
  paidOut: boolean;
  card: ReadonlyArray<number>;
};

const bingoABI = narrow(BingoAbi);
const bingoFactoryABI = narrow(BingoFactoryAbi);

export type BingoContractData = {
  address: Address;
  abi: typeof bingoABI;
};

export type BingoFactoryContractData = {
  address: Address;
  abi: typeof bingoFactoryABI;
};
