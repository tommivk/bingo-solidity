import { ethers } from "ethers";
import { toast } from "react-toastify";
import {
  usePrepareContractWrite,
  Address,
  useContractWrite,
  useContractEvent,
} from "wagmi";
import { GameStatus } from "../constants";
import useCountdown from "../hooks/useCountdown";
import { BingoContractData, GameState, Ticket } from "../types";
import { parseErrorMessage } from "../util";
import Button from "./Button";
import { Block } from "@ethersproject/abstract-provider";
import { useState } from "react";
import Modal from "./Modal";
import DebugModal from "./DebugModal";

type Props = {
  contractData: BingoContractData;
  gameState: GameState;
  account: Address | undefined;
  ticket: Ticket | undefined;
  updateTicket: () => void;
  updateAllBingoCards: () => void;
  updateDrawnNumbers: () => void;
  updateIsBingo: () => void;
  updateGameState: () => void;
  isBingo: boolean;
  isWinner: boolean;
  block: Block;
};

const PlayerActions = ({
  contractData,
  account,
  gameState,
  ticket,
  updateTicket,
  updateAllBingoCards,
  updateIsBingo,
  updateDrawnNumbers,
  updateGameState,
  isBingo,
  isWinner,
  block,
}: Props) => {
  const [vrfRequest, setVrfRequest] = useState<{
    requested: boolean;
    fulfilled: boolean;
    requestId?: ethers.BigNumber;
  }>({
    requested: false,
    fulfilled: false,
    requestId: undefined,
  });

  const leaveGameEnabled =
    gameState &&
    !!ticket &&
    gameState.gameStatus === GameStatus.SETUP &&
    !!ticket.valid;

  const joinGameEnabled =
    gameState &&
    !!ticket &&
    gameState.gameStatus === GameStatus.SETUP &&
    !ticket.valid;

  const callBingoEnabled =
    gameState &&
    gameState.gameStatus !== GameStatus.SETUP &&
    isBingo &&
    !isWinner;

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

  const { config: callBingoConfig, error: prepareCallBingoError } =
    usePrepareContractWrite({
      ...contractData,
      functionName: "callBingo",
      overrides: {
        from: account,
      },
      enabled: callBingoEnabled,
    });

  const { write: callBingo, isLoading: callBingoLoading } = useContractWrite({
    ...callBingoConfig,
    onError({ message }) {
      toast.error(parseErrorMessage(message, "Failed to call bingo"));
    },
    onSuccess: async (data) => {
      await data.wait();
      toast.info("Bingo successfully called!");
    },
  });

  const handleLeaveGame = () => {
    if (prepareLeaveGameError) {
      return toast.error("Failed to leave the game");
    }
    leaveGame?.();
  };

  const handleJoinGame = () => {
    if (prepareJoinGameError) {
      return toast.error("Failed to join the game");
    }
    joinGame?.();
  };

  const handleCallBingo = () => {
    if (prepareCallBingoError) {
      return toast.error("Failed to call bingo");
    }
    callBingo?.();
  };

  const bingoCallDeadline = ethers.BigNumber.from(
    gameState.bingoFoundTime
      .add(ethers.BigNumber.from(gameState.bingoCallPeriod))
      .sub(block.timestamp)
  );
  const [timeLeftToCallBingo] = useCountdown(Number(bingoCallDeadline));

  const withdrawWinningsEnabled =
    !!ticket && !ticket.paidOut && isWinner && timeLeftToCallBingo <= 0;

  const {
    config: withdrawWinningsConfig,
    error: prepareWithdrawWinningsError,
    refetch: refetchPrepareWithdrawWinnings,
  } = usePrepareContractWrite({
    ...contractData,
    functionName: "withdrawWinnings",
    enabled: withdrawWinningsEnabled,
  });

  const { write: withdrawWinnings, isLoading: withdrawWinningsLoading } =
    useContractWrite({
      ...withdrawWinningsConfig,
      onError({ message }) {
        toast.error(parseErrorMessage(message, "Failed to withdraw"));
      },
      onSuccess: async (data) => {
        await data.wait();
        updateGameState();
        updateTicket();
        toast.success("Successfully withdrawed!");
      },
    });

  useContractEvent({
    ...contractData,
    eventName: "VRFRequested",
    listener(vrfRequestId) {
      if (vrfRequest.requestId && !vrfRequest.fulfilled) {
        console.error("VRF event missed");
        updateDrawnNumbers();
        updateTicket();
        updateGameState();
        updateAllBingoCards();
        updateIsBingo();
      }
      setVrfRequest({
        requestId: vrfRequestId,
        fulfilled: false,
        requested: true,
      });
    },
  });

  useContractEvent({
    ...contractData,
    eventName: "VRFFulfilled",
    listener(vrfRequestId) {
      if (vrfRequest.requestId && !vrfRequest.requestId.eq(vrfRequestId)) {
        console.error("VRF event missed");
        updateDrawnNumbers();
        updateTicket();
        updateGameState();
        updateAllBingoCards();
        updateIsBingo();
      }
      setVrfRequest({ ...vrfRequest, fulfilled: true, requested: false });
    },
  });

  const handleWithdrawWinnings = async () => {
    await refetchPrepareWithdrawWinnings();
    if (prepareWithdrawWinningsError) {
      return toast.error("Failed to withdraw");
    }
    withdrawWinnings?.();
  };

  return (
    <div className="h-32 bg-darkSecondary w-full flex flex-col justify-center items-center">
      <Modal open={callBingoEnabled} closeButton={false}>
        <Modal.Header>You have a Bingo!</Modal.Header>
        <Modal.Content>
          <div className="px-5 py-6">
            <Button
              onClick={handleCallBingo}
              disabled={!callBingoEnabled}
              loading={callBingoLoading}
            >
              Call Bingo
            </Button>
          </div>
        </Modal.Content>
      </Modal>

      {gameState.gameStatus === GameStatus.BINGOFOUND && (
        <>
          {ticket && isWinner ? (
            <>
              <h1 className="mb-4">You Are a Winner!</h1>
              {!ticket.paidOut && timeLeftToCallBingo > 0 && (
                <p>Claiming winnings opens in: ~ {timeLeftToCallBingo}</p>
              )}
              {!ticket.paidOut && timeLeftToCallBingo <= 0 && (
                <Button
                  onClick={handleWithdrawWinnings}
                  loading={withdrawWinningsLoading}
                >
                  Withdraw Winnings
                </Button>
              )}
              {ticket.paidOut && <p>Winnings successfully withdrawed</p>}
            </>
          ) : (
            <h1>Bingo has been found!</h1>
          )}
        </>
      )}

      {joinGameEnabled && (
        <Button onClick={handleJoinGame} loading={joinGameLoading} size="lg">
          Join game
        </Button>
      )}
      {leaveGameEnabled && (
        <Button
          onClick={handleLeaveGame}
          loading={leaveGameLoading}
          className="sm:mr-auto sm:ml-10"
        >
          Leave game
        </Button>
      )}

      {gameState.gameStatus == GameStatus.RUNNING &&
        gameState.totalNumbersDrawn < 75 && (
          <>
            {!vrfRequest.requested && (
              <p>Waiting for the next number to be drawn ...</p>
            )}
            {vrfRequest.requested && (
              <p>Waiting for the number to be confirmed ...</p>
            )}
          </>
        )}

      {gameState.gameStatus == GameStatus.RUNNING && (
        <div className="absolute left-10">
          <DebugModal contractData={contractData} />
        </div>
      )}
    </div>
  );
};

export default PlayerActions;
