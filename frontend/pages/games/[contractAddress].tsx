import Link from "next/link";
import { useContractRead, useAccount, useContractEvent } from "wagmi";
import { GetServerSidePropsContext } from "next";
import { abi } from "../../abi/Bingo";
import BingoCard from "../../components/BingoCard";
import GameDetails from "../../components/GameDetails";
import Button from "../../components/Button";
import BingoCardList from "../../components/BingoCardList";
import HostActions from "../../components/HostActions";
import { ethers } from "ethers";
import { BingoContractData } from "../../types";
import { toast } from "react-toastify";
import PlayerActions from "../../components/PlayerActions";

const AddressZero = ethers.constants.AddressZero;

const Game = ({ contractAddress }: { contractAddress: string }) => {
  const { address: account } = useAccount();

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

  const { data: isWinner = false } = useContractRead({
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
      toast.info("The game started");
    },
  });

  useContractEvent({
    ...contractData,
    eventName: "NumberDrawn",
    listener(number) {
      updateDrawnNumbers();
      updateIsBingo();
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
    },
  });

  if (!gameState || !host) {
    return "loading...";
  }

  const isHost = !!account && account === host;

  return (
    <>
      <Link href={"/"}>
        <Button>All games</Button>
      </Link>
      <GameDetails
        gameState={gameState}
        host={host}
        isHost={isHost}
        contractData={contractData}
        ticket={ticket}
      />

      <h2>Numbers drawn</h2>
      <ul>
        {numbersDrawn.map((num) => (
          <li key={num}>{num}</li>
        ))}
      </ul>
      <div className="flex justify-evenly">
        {ticket && ticket.valid && (
          <BingoCard card={ticket.card} numbersDrawn={numbersDrawn} />
        )}
        <BingoCardList
          allBingoCards={allBingoCards}
          numbersDrawn={numbersDrawn}
        />
      </div>
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
      />
    </>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { contractAddress } = context.query;
  return { props: { contractAddress } };
};

export default Game;
