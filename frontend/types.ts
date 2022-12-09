import { BigNumber } from "ethers";
import { Address } from "wagmi";
import { narrow } from "abitype";
import { abi as BingoAbi } from "./abi/Bingo";
import { abi as BingoFactoryAbi } from "./abi/BingoFactory";

export type GameState = {
  ticketCost: BigNumber;
  maxPlayers: number;
  playersJoined: number;
  totalNumbersDrawn: number;
  hostActionDeadline: number;
  bingoCallPeriod: number;
  winnerCount: number;
  hostLastActionTime: BigNumber;
  bingoFoundTime: BigNumber;
  gameStatus: number;
  joinedPlayers: readonly Address[];
};

const bingoABI = narrow(BingoAbi);
const bingoFactoryABI = narrow(BingoFactoryAbi);

export type BingoContractData = {
  address: string;
  abi: typeof bingoABI;
};

export type BingoFactoryContractData = {
  address: string;
  abi: typeof bingoFactoryABI;
};
