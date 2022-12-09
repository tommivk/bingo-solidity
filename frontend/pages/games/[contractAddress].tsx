import Link from "next/link";
import { useMemo } from "react";
import {
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useAccount,
  useContractEvent,
  Address,
} from "wagmi";
import { GetServerSidePropsContext } from "next";
import { abi } from "../../abi/Bingo";
import BingoCard from "../../components/BingoCard";
import GameDetails from "../../components/GameDetails";
import Button from "../../components/Button";
import BingoCardList from "../../components/BingoCardList";
import { GameStatus } from "../../constants";
import HostActions from "../../components/HostActions";
import { Event } from "ethers";
import { BingoContractData } from "../../types";

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

  const { data: host } = useContractRead({
    ...contractData,
    functionName: "host",
  });

  const isHost = useMemo(
    () => account !== undefined && account === host,
    [account, host]
  );

  const { data: ticket, refetch: updateTicket } = useContractRead({
    ...contractData,
    functionName: "getTicket",
    overrides: {
      from: account,
    },
    args: account && [account],
    enabled: account !== undefined,
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

  const { data: isWinner, refetch: updateIsWinner } = useContractRead({
    ...contractData,
    functionName: "winners",
    args: account && [account],
    enabled: account !== undefined,
  });

  const { data: isBingo, refetch: updateIsBingo } = useContractRead({
    ...contractData,
    functionName: "checkBingo",
    args: ticket && [ticket.card],
    enabled: ticket !== undefined,
  });

  const { config: joinGameConfig } = usePrepareContractWrite({
    ...contractData,
    functionName: "buyTicket",
    overrides: {
      value: gameState?.ticketCost,
    },
    args: account && [account],
    enabled: gameState && ticket && !ticket.valid,
  });
  const { write: joinGame } = useContractWrite(joinGameConfig);

  const { config: leaveGameConfig } = usePrepareContractWrite({
    ...contractData,
    functionName: "leaveGame",
    enabled:
      gameState?.gameStatus === GameStatus.SETUP && ticket && ticket.valid,
  });
  const { write: leaveGame } = useContractWrite({
    ...leaveGameConfig,
    onSuccess() {
      updateGameState();
      updateAllBingoCards();
      updateTicket();
    },
  });

  const { config: callBingoConfig } = usePrepareContractWrite({
    ...contractData,
    functionName: "callBingo",
    overrides: {
      from: account,
    },
    enabled: gameState?.gameStatus !== GameStatus.SETUP && isBingo && !isWinner,
  });
  const { write: callBingo } = useContractWrite({
    ...callBingoConfig,
    onSuccess() {
      updateGameState();
      updateIsWinner();
    },
  });

  useContractEvent({
    ...contractData,
    eventName: "GameStarted",
    listener() {
      updateGameState();
    },
  });

  useContractEvent({
    ...contractData,
    eventName: "NumberDrawn",
    listener() {
      updateDrawnNumbers();
      updateIsBingo();
    },
  });

  useContractEvent({
    ...contractData,
    eventName: "TicketBought",
    listener(_node: Address, label: Event) {
      if (label?.args?._to === account) {
        updateTicket();
      }
      updateAllBingoCards();
      updateGameState();
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
        contractAddress={contractAddress}
      />

      {gameState.gameStatus == GameStatus.SETUP && !ticket?.valid && (
        <Button onClick={() => joinGame?.()}>Join game</Button>
      )}
      {gameState.gameStatus == GameStatus.SETUP && ticket?.valid && (
        <Button onClick={() => leaveGame?.()}>Leave game</Button>
      )}
      {isBingo && !isWinner && (
        <Button onClick={() => callBingo?.()}>Bingo</Button>
      )}

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
