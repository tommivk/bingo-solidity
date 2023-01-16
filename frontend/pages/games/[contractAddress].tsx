import Link from "next/link";
import {
  useContractRead,
  useAccount,
  useContractEvent,
  useProvider,
  useNetwork,
} from "wagmi";
import { GetServerSidePropsContext } from "next";
import { abi } from "../../abi/Bingo";
import BingoCard from "../../components/BingoCard";
import GameDetails from "../../components/GameDetails";
import Button from "../../components/Button";
import HostActions from "../../components/HostActions";
import { ethers } from "ethers";
import { BingoContractData } from "../../types";
import { toast } from "react-toastify";
import PlayerActions from "../../components/PlayerActions";
import GameInfoCard from "../../components/GameInfoCard";
import WrongNetworkError from "../../components/WrongNetworkError";
import useBlock from "../../hooks/useBlock";

const AddressZero = ethers.constants.AddressZero;
const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID);

const Game = ({ contractAddress }: { contractAddress: string }) => {
  const { address: account } = useAccount();
  const provider = useProvider();
  const {
    data: block,
    isLoading: blockLoading,
    error: blockError,
  } = useBlock(provider);
  const { chain } = useNetwork();

  const contractData: BingoContractData = {
    address: contractAddress,
    abi: [...abi] as const,
  };

  const { data: gameState, refetch: updateGameState } = useContractRead({
    ...contractData,
    functionName: "getGame",
  });

  const { data: host, refetch: updateHost } = useContractRead({
    ...contractData,
    functionName: "host",
  });

  const { data: ticket, refetch: updateTicket } = useContractRead({
    ...contractData,
    functionName: "getTicket",
    overrides: {
      from: account,
    },
    args: account && [account],
    enabled: !!account,
  });

  const { data: allBingoCards = [], refetch: updateAllBingoCards } =
    useContractRead({
      ...contractData,
      functionName: "getBingoCards",
    });

  const { data: numbersDrawn = [], refetch: updateDrawnNumbers } =
    useContractRead({
      ...contractData,
      functionName: "getDrawnNumbers",
    });

  const { data: isWinner = false, refetch: updateIsWinner } = useContractRead({
    ...contractData,
    functionName: "winners",
    args: account && [account],
    enabled: !!account,
  });

  const { data: isBingo = false, refetch: updateIsBingo } = useContractRead({
    ...contractData,
    functionName: "checkBingo",
    args: ticket && [ticket.card],
    enabled: !!ticket,
  });

  const { data: winners = [], refetch: updateWinners } = useContractRead({
    ...contractData,
    functionName: "getWinners",
  });

  useContractEvent({
    ...contractData,
    eventName: "PlayerLeft",
    listener(player, _event) {
      if (player !== account) {
        updateGameState();
        updateAllBingoCards();
      }
    },
  });

  useContractEvent({
    ...contractData,
    eventName: "HostChanged",
    listener(newHost) {
      updateHost();
      if (newHost === AddressZero) {
        return toast.info("The game host has left the game");
      }
      if (newHost === account) {
        return toast.info("You are now the game host");
      }
      toast.info("The game host has changed");
    },
  });

  useContractEvent({
    ...contractData,
    eventName: "GameStarted",
    listener() {
      updateGameState();
      toast.info("The game has started");
    },
  });

  useContractEvent({
    ...contractData,
    eventName: "NumberDrawn",
    listener(number) {
      updateDrawnNumbers();
      updateIsBingo();
      updateGameState();
      toast.info(`New number drawn: ${number}`);
    },
  });

  useContractEvent({
    ...contractData,
    eventName: "TicketBought",
    listener(to) {
      if (to !== account) {
        updateAllBingoCards();
        updateGameState();
        toast.info("New player joined the game");
      }
    },
  });

  useContractEvent({
    ...contractData,
    eventName: "BingoFound",
    listener(address) {
      if (address === account) {
        toast.info("Bingo successfully called!");
      } else {
        toast.info("Bingo has been found!");
      }
      updateGameState();
      updateIsWinner();
      updateWinners();
    },
  });

  if (!gameState || !host || !block) {
    return "loading...";
  }

  const isHost = !!account && account === host;

  return (
    <div className="min-h-screen flex flex-col justify-between relative">
      {chain && chain.id !== CHAIN_ID && <WrongNetworkError />}
      <div>
        <Link href={"/"}>
          <Button className="mt-4 ml-4">All games</Button>
        </Link>
        <GameDetails
          gameState={gameState}
          host={host}
          isHost={isHost}
          contractData={contractData}
          ticket={ticket}
        />
        <div className="flex justify-evenly flex-wrap gap-4 mt-10">
          <BingoCard
            card={
              ticket && ticket.valid
                ? ticket.card
                : Array.from("BINGO".repeat(5))
            }
            numbersDrawn={numbersDrawn}
          />
          <GameInfoCard
            allBingoCards={allBingoCards}
            numbersDrawn={numbersDrawn}
            winners={winners}
          />
        </div>
      </div>
      <div>
        {isHost && (
          <HostActions gameState={gameState} contractData={contractData} />
        )}
        <PlayerActions
          contractData={contractData}
          account={account}
          gameState={gameState}
          ticket={ticket}
          updateTicket={updateTicket}
          updateAllBingoCards={updateAllBingoCards}
          updateGameState={updateGameState}
          isBingo={isBingo}
          isWinner={isWinner}
          block={block}
        />
      </div>
    </div>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { contractAddress } = context.query;
  return { props: { contractAddress } };
};

export default Game;
