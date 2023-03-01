import { Address, useContractRead } from "wagmi";
import { BingoContractData } from "../types";

const useBingoContractReads = (
  account: Address | undefined,
  contractData: BingoContractData
) => {
  const {
    data: gameState,
    refetch: updateGameState,
    error: gameStateError,
    isLoading: gameStateLoading,
  } = useContractRead({
    ...contractData,
    functionName: "getGame",
  });

  const {
    data: host,
    refetch: updateHost,
    error: hostError,
    isLoading: hostLoading,
  } = useContractRead({
    ...contractData,
    functionName: "host",
  });

  const {
    data: gameFee,
    isLoading: gameFeeLoading,
    error: gameFeeError,
  } = useContractRead({
    ...contractData,
    functionName: "gameFee",
  });

  const {
    data: ticket,
    refetch: updateTicket,
    isLoading: ticketLoading,
    error: ticketError,
  } = useContractRead({
    ...contractData,
    functionName: "getTicket",
    overrides: {
      from: account,
    },
    args: account && [account],
    enabled: !!account,
  });

  const {
    data: allBingoCards = [],
    refetch: updateAllBingoCards,
    isLoading: allBingoCardsLoading,
    error: allBingoCardsError,
  } = useContractRead({
    ...contractData,
    functionName: "getBingoCards",
  });

  const {
    data: numbersDrawn = [],
    refetch: updateDrawnNumbers,
    isLoading: numbersDrawnLoading,
    error: numbersDrawnError,
  } = useContractRead({
    ...contractData,
    functionName: "getDrawnNumbers",
  });

  const {
    data: isWinner = false,
    refetch: updateIsWinner,
    isLoading: isWinnerLoading,
    error: isWinnerError,
  } = useContractRead({
    ...contractData,
    functionName: "winners",
    args: account && [account],
    enabled: !!account,
  });

  const {
    data: isBingo = false,
    refetch: updateIsBingo,
    isLoading: isBingoLoading,
    error: isBingoError,
  } = useContractRead({
    ...contractData,
    functionName: "checkBingo",
    args: ticket && [ticket.card],
    enabled: !!ticket,
  });

  const {
    data: winners = [],
    refetch: updateWinners,
    isLoading: winnersLoading,
    error: winnersError,
  } = useContractRead({
    ...contractData,
    functionName: "getWinners",
  });

  const error =
    gameStateError ??
    hostError ??
    ticketError ??
    allBingoCardsError ??
    numbersDrawnError ??
    isWinnerError ??
    isBingoError ??
    winnersError ??
    gameFeeError;

  const loading =
    gameStateLoading ||
    hostLoading ||
    ticketLoading ||
    allBingoCardsLoading ||
    numbersDrawnLoading ||
    isWinnerLoading ||
    isBingoLoading ||
    winnersLoading ||
    gameFeeLoading;

  const data = {
    gameState,
    host,
    gameFee,
    allBingoCards,
    numbersDrawn,
    isBingo,
    isWinner,
    winners,
    ticket,
  };

  const refetchFuncs = {
    updateGameState,
    updateAllBingoCards,
    updateDrawnNumbers,
    updateHost,
    updateIsBingo,
    updateWinners,
    updateIsWinner,
    updateTicket,
  };

  return [data, loading, refetchFuncs, error] as const;
};

export default useBingoContractReads;
