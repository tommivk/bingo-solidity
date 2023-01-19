import { ethers } from "ethers";
import Link from "next/link";
import { useContractRead } from "wagmi";
import { BingoContractData } from "../types";
import { abi as BingoContractAbi } from "../abi/Bingo";
import Spinner from "./Spinner";
import { gameStatusToString } from "../util";

type Props = {
  contractAddress: string;
};

const RoomDetails = ({ contractAddress }: Props) => {
  const contractData: BingoContractData = {
    address: contractAddress,
    abi: [...BingoContractAbi] as const,
  };

  const { data: gameState, isLoading } = useContractRead({
    ...contractData,
    functionName: "getGame",
  });

  const gameStatus = gameStatusToString(gameState);

  return (
    <Link href={`/games/${contractAddress}`}>
      <div className="p-5 text-slate-400 min-h-[80px] w-[500px] max-w-[90vw] bg-darkSecondary rounded-lg cursor-pointer hover:scale-[1.03] delay-100">
        <p className="p-3 text-center text-slate-200 text-ellipsis overflow-hidden">
          {contractAddress}
        </p>
        {isLoading || !gameState ? (
          <div className="flex justify-center">
            <Spinner size={30} />
          </div>
        ) : (
          <>
            <p>
              Players joined: {gameState.joinedPlayers.length} /{" "}
              {gameState.maxPlayers}
            </p>
            <p>Game status: {gameStatus}</p>
            <p>
              Ticket cost:{" "}
              {gameState.ticketCost &&
                ethers.utils.formatEther(gameState.ticketCost)}{" "}
              MATIC
            </p>
          </>
        )}
      </div>
    </Link>
  );
};

export default RoomDetails;
