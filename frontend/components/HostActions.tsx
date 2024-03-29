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

  const startGameEnabled =
    gameState.gameStatus === GameStatus.SETUP &&
    gameState.joinedPlayers.length >= gameState.minPlayers;

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
    onSuccess: async (data) => {
      await data.wait();
    },
  });

  const handleStartGame = () => {
    if (prepareStartGameError || !startGame) {
      return toast.error("Failed to start game");
    }
    startGame();
  };

  return (
    <div className="flex justify-center items-center mb-4">
      <Modal open={modalOpen} closeButton={false}>
        <Modal.Header>You are the game host</Modal.Header>
        <Modal.Content>
          <p className="max-w-xs">
            You can start the game when at least minimum amount of players have
            joined.
          </p>
        </Modal.Content>
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
    </div>
  );
};

export default HostActions;
