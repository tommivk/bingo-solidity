import { toast } from "react-toastify";
import { usePrepareContractWrite, Address, useContractWrite } from "wagmi";
import { GameStatus } from "../constants";
import { BingoContractData, GameState, Ticket } from "../types";
import { parseErrorMessage } from "../util";
import Button from "./Button";

type Props = {
  contractData: BingoContractData;
  gameState: GameState;
  account: Address | undefined;
  ticket: Ticket | undefined;
  updateTicket: () => void;
  updateAllBingoCards: () => void;
  updateGameState: () => void;
  isBingo: boolean;
  isWinner: boolean;
};

const PlayerActions = ({
  contractData,
  account,
  gameState,
  ticket,
  updateTicket,
  updateAllBingoCards,
  updateGameState,
  isBingo,
  isWinner,
}: Props) => {
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
    !!gameState &&
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

  return (
    <div className="h-20 bg-darkSecondary w-full flex justify-center items-center">
      {joinGameEnabled && (
        <Button onClick={handleJoinGame} loading={joinGameLoading}>
          Join game
        </Button>
      )}
      {leaveGameEnabled && (
        <Button onClick={handleLeaveGame} loading={leaveGameLoading}>
          Leave game
        </Button>
      )}
      {!isWinner && gameState.gameStatus !== GameStatus.SETUP && (
        <Button
          onClick={handleCallBingo}
          disabled={!callBingoEnabled}
          loading={callBingoLoading}
        >
          Call Bingo
        </Button>
      )}
    </div>
  );
};

export default PlayerActions;
