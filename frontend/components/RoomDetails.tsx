import { ethers } from "ethers";
import Link from "next/link";
import { useContractRead } from "wagmi";
import { BingoContractData } from "../types";
import { abi as BingoContractAbi } from "../abi/Bingo";
import Spinner from "./Spinner";

type Props = {
  contractAddress: string;
};

const RoomDetails = ({ contractAddress }: Props) => {
  const contractData: BingoContractData = {
    address: contractAddress,
    abi: [...BingoContractAbi] as const,
  };

  const { data, isLoading } = useContractRead({
    ...contractData,
    functionName: "getGame",
  });

  const parseGameStatus = (status: number) => {
    if (status === 0) return "Lobby";
    if (status === 1) return "Running";
    if (status === 2) return "Finished";
  };

  return (
    <Link href={`/games/${contractAddress}`}>
      <div className="p-5 text-slate-400 min-h-[80px] w-[500px] max-w-[90vw] bg-darkSecondary rounded-lg cursor-pointer hover:scale-[1.03] delay-100">
        <p className="p-3 text-center text-slate-200 text-ellipsis overflow-hidden">
          {contractAddress}
        </p>
        {isLoading || !data ? (
          <div className="flex justify-center">
            <Spinner size={30} />
          </div>
        ) : (
          <>
            <p>
              Players joined: {data.joinedPlayers.length} / {data.maxPlayers}
            </p>
            <p>Game status: {parseGameStatus(data.gameStatus)}</p>
            <p>
              Ticket cost:{" "}
              {data.ticketCost && ethers.utils.formatEther(data.ticketCost)}{" "}
              MATIC
            </p>
          </>
        )}
      </div>
    </Link>
  );
};

export default RoomDetails;
