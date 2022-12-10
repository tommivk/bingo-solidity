import Link from "next/link";
import { useMemo } from "react";
import {
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useAccount,
  useContractEvent,
} from "wagmi";
import { GetServerSidePropsContext } from "next";
import { abi } from "../../abi/Bingo";
import BingoCard from "../../components/BingoCard";
import GameDetails from "../../components/GameDetails";
import Button from "../../components/Button";
import BingoCardList from "../../components/BingoCardList";
import { GameStatus } from "../../constants";
import HostActions from "../../components/HostActions";
import { ethers } from "ethers";
import { BingoContractData } from "../../types";
import { toast } from "react-toastify";
import { parseErrorMessage } from "../../util";

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

  const isHost = !!account && account === host;

  const { data: ticket, refetch: updateTicket } = useContractRead({
    ...contractData,
    functionName: "getTicket",
    overrides: {
      from: account,
    },
    args: account && [account],
    enabled: !!account,
  });

  const leaveGameEnabled =
    !!gameState &&
    !!ticket &&
    gameState.gameStatus === GameStatus.SETUP &&
    ticket?.valid;

  const joinGameEnabled =
    !!gameState &&
    !!ticket &&
    gameState.gameStatus === GameStatus.SETUP &&
    !ticket.valid;

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

  const { data: isWinner, refetch: updateIsWinner } = useContractRead({
    ...contractData,
    functionName: "winners",
    args: account && [account],
    enabled: !!account,
  });

  const { data: isBingo, refetch: updateIsBingo } = useContractRead({
    ...contractData,
    functionName: "checkBingo",
    args: ticket && [ticket.card],
    enabled: !!ticket,
  });

  const { config: joinGameConfig, error: prepareJoinGameError } =
    usePrepareContractWrite({
      ...contractData,
      functionName: "buyTicket",
      overrides: {
        value: gameState?.ticketCost,
      },
      args: account && [account],
      enabled: joinGameEnabled,
    });
  const { write: joinGame, isLoading: joinGameLoading } = useContractWrite({
    ...joinGameConfig,
    onError({ message }) {
      toast.error(parseErrorMessage(message, "Failed to join the game"));
    },
    onSuccess: async (data) => {
      await data.wait();
      updateTicket();
      updateAllBingoCards();
      updateGameState();
      toast.success("Successfully joined");
    },
  });

  const { config: leaveGameConfig, error: prepareLeaveGameError } =
    usePrepareContractWrite({
      ...contractData,
      functionName: "leaveGame",
      enabled: leaveGameEnabled,
    });

  const { write: leaveGame, isLoading: leaveGameLoading } = useContractWrite({
    ...leaveGameConfig,
    onError({ message }) {
      toast.error(parseErrorMessage(message, "Failed to leave the game"));
    },
    onSuccess: async (data) => {
      await data.wait();
      updateTicket();
      updateAllBingoCards();
      updateGameState();
      toast.success("Successfully left the game");
    },
  });

  const callBingoEnabled =
    !!gameState &&
    gameState.gameStatus !== GameStatus.SETUP &&
    typeof isBingo === "boolean" &&
    isBingo &&
    typeof isWinner === "boolean" &&
    !isWinner;

  const { config: callBingoConfig, error: prepareCallBingoError } =
    usePrepareContractWrite({
      ...contractData,
      functionName: "callBingo",
      overrides: {
        from: account,
      },
      enabled: callBingoEnabled,
    });
  const { write: callBingo } = useContractWrite({
    ...callBingoConfig,
    onError({ message }) {
      toast.error(parseErrorMessage(message, "Failed to call bingo"));
    },
    onSuccess: async (data) => {
      await data.wait();
      toast.success("Bingo successfully called!");
    },
  });

  const handleLeaveGame = () => {
    if (prepareLeaveGameError) {
      return toast.error("Error");
    }
    leaveGame?.();
  };

  const handleJoinGame = () => {
    if (prepareJoinGameError) {
      return toast.error("Error");
    }
    joinGame?.();
  };

  const handleCallBingo = () => {
    if (prepareCallBingoError) {
      return toast.error("Error");
    }
    callBingo?.();
  };

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

  if (!gameState || !host) {
    return "loading...";
  }

  return (
    <>
      <Link href={"/"}>All games</Link>

      <GameDetails
        gameState={gameState}
        host={host}
        isHost={isHost}
        contractData={contractData}
        ticket={ticket}
      />

      {joinGameEnabled && <Button onClick={handleJoinGame}>Join game</Button>}
      {leaveGameEnabled && (
        <Button onClick={handleLeaveGame}>Leave game</Button>
      )}
      {callBingoEnabled && <Button onClick={handleCallBingo}>Bingo</Button>}

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
