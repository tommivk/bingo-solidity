import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { BingoContractData, GameState } from "../types";
import { GameStatus } from "../constants";
import { toast } from "react-toastify";
import { parseErrorMessage } from "../util";
import Button from "./Button";
import Modal from "./Modal";
import { useState } from "react";

type Props = {
  gameState: GameState;
  contractData: BingoContractData;
};

const HostActions = ({ contractData, gameState }: Props) => {
  const [modalOpen, setModalOpen] = useState(
    gameState.gameStatus === GameStatus.SETUP
  );
  const startGameEnabled = gameState.gameStatus === GameStatus.SETUP;
  const drawNumberEnabled = gameState.gameStatus === GameStatus.RUNNING;

  const { config: startGameConfig, error: prepareStartGameError } =
    usePrepareContractWrite({
      ...contractData,
      functionName: "startGame",
      enabled: startGameEnabled,
    });

  const { write: startGame, isLoading: startGameLoading } = useContractWrite({
    ...startGameConfig,
    onError({ message }) {
      toast.error(parseErrorMessage(message, "Failed to start the game"));
    },
  });

  const { config: drawNumberConfig, error: prepareDrawNumberError } =
    usePrepareContractWrite({
      ...contractData,
      functionName: "drawNumber",
      enabled: drawNumberEnabled,
    });

  const { write: drawNumber, isLoading: drawNumberLoading } = useContractWrite({
    ...drawNumberConfig,
    onError({ message }) {
      toast.error(parseErrorMessage(message, "Failed to draw number"));
    },
  });

  const handleStartGame = () => {
    if (prepareStartGameError) {
      return toast.error("Error");
    }
    startGame?.();
  };

  const handleDrawNumber = () => {
    if (prepareDrawNumberError) {
      return toast.error("Error");
    }
    drawNumber?.();
  };

  return (
    <div className="flex justify-center items-center mb-4">
      <Modal open={modalOpen} closeButton={false}>
        <Modal.Header>You are the game host</Modal.Header>
        <Modal.Content>You can start the game when you like</Modal.Content>
        <Modal.Footer>
          <Button onClick={() => setModalOpen(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
      {startGameEnabled && (
        <div className="sm:absolute bottom-6 mt-4">
          <Button
            onClick={handleStartGame}
            loading={startGameLoading}
            size="lg"
          >
            Start Game
          </Button>
        </div>
      )}

      {drawNumberEnabled && (
        <>
          <Button onClick={handleDrawNumber} loading={drawNumberLoading}>
            Draw number
          </Button>
        </>
      )}
    </div>
  );
};

export default HostActions;
