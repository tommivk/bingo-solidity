import { ethers } from "ethers";
import { Address } from "wagmi";
import { GameStatus } from "../constants";
import useCountdown from "../hooks/useCountdown";
import { BingoContractData, GameState, Ticket } from "../types";
import Button from "./Button";
import { Block } from "@ethersproject/abstract-provider";
import Modal from "./Modal";
import DebugModal from "./DebugModal";
import useJoinGame from "../hooks/useJoinGame";
import useLeaveGame from "../hooks/useLeaveGame";
import useCallBingo from "../hooks/useCallBingo";
import useWithdrawWinnings from "../hooks/useWithdrawWinnings";
import useVRFRequest from "../hooks/useVRFRequest";

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
  const updateState = () => {
    updateTicket();
    updateAllBingoCards();
    updateGameState();
    updateDrawnNumbers();
    updateIsBingo();
  };

  const leaveGameEnabled =
    gameState &&
    !!ticket &&
    gameState.gameStatus === GameStatus.SETUP &&
    !!ticket.valid;

  const callBingoEnabled =
    gameState &&
    gameState.gameStatus !== GameStatus.SETUP &&
    isBingo &&
    !isWinner;

  const joinGameEnabled =
    gameState &&
    !!ticket &&
    gameState.gameStatus === GameStatus.SETUP &&
    !ticket.valid;

  const [joinGame, joinGameLoading] = useJoinGame({
    contractData,
    gameState,
    account,
    enabled: joinGameEnabled,
    updateState,
  });

  const [leaveGame, leaveGameLoading] = useLeaveGame({
    contractData,
    enabled: leaveGameEnabled,
    updateState,
  });

  const [callBingo, callBingoLoading] = useCallBingo({
    contractData,
    account,
    enabled: callBingoEnabled,
  });

  const bingoCallDeadline = ethers.BigNumber.from(
    gameState.bingoFoundTime
      .add(ethers.BigNumber.from(gameState.bingoCallPeriod))
      .sub(block.timestamp)
  );

  const [timeLeftToCallBingo] = useCountdown(Number(bingoCallDeadline));

  const withdrawWinningsEnabled =
    !!ticket && !ticket.paidOut && isWinner && timeLeftToCallBingo <= 0;

  const [withdrawWinnings, withdrawWinningsLoading] = useWithdrawWinnings({
    contractData,
    enabled: withdrawWinningsEnabled,
    updateState,
  });

  const [vrfRequest] = useVRFRequest({ contractData, updateState });

  return (
    <div className="h-32 bg-darkSecondary w-full flex flex-col justify-center items-center">
      <Modal open={callBingoEnabled} closeButton={false}>
        <Modal.Header>You have a Bingo!</Modal.Header>
        <Modal.Content>
          <div className="px-5 py-6">
            <Button
              onClick={callBingo}
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
                  onClick={withdrawWinnings}
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
        <Button onClick={joinGame} loading={joinGameLoading} size="lg">
          Join game
        </Button>
      )}
      {leaveGameEnabled && (
        <Button
          onClick={leaveGame}
          loading={leaveGameLoading}
          className="sm:mr-auto sm:ml-10"
        >
          Leave game
        </Button>
      )}

      {gameState.gameStatus == GameStatus.RUNNING &&
        gameState.totalNumbersDrawn < 75 && (
          <p>
            {vrfRequest.requested
              ? "Waiting for the number to be confirmed ..."
              : "Waiting for the next number to be drawn ..."}
          </p>
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
