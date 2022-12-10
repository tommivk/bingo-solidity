import { useState } from "react";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { BingoContractData, GameState } from "../types";
import { GameStatus } from "../constants";
import { toast } from "react-toastify";
import { parseErrorMessage } from "../util";
import Button from "./Button";

type Props = {
  gameState: GameState;
  contractData: BingoContractData;
};

const HostActions = ({ contractData, gameState }: Props) => {
  const [number, setNumber] = useState(1);

  const startGameEnabled = gameState.gameStatus === GameStatus.SETUP;
  const drawNumberEnabled = gameState.gameStatus === GameStatus.RUNNING;

  const { config: startGameConfig, error: prepareStartGameError } =
    usePrepareContractWrite({
      ...contractData,
      functionName: "startGame",
      enabled: startGameEnabled,
    });

  const { write: startGame } = useContractWrite({
    ...startGameConfig,
    onError({ message }) {
      toast.error(parseErrorMessage(message, "Failed to start the game"));
    },
    onSuccess: async (data) => {
      await data.wait();
      toast.success("Game successfully started");
    },
  });

  const { config: drawNumberConfig, error: prepareDrawNumberError } =
    usePrepareContractWrite({
      ...contractData,
      functionName: "drawNumber",
      args: [number],
      enabled: drawNumberEnabled,
    });

  const { write: drawNumber } = useContractWrite({
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
    <div>
      {startGameEnabled && (
        <Button onClick={handleStartGame}>Start game</Button>
      )}

      {drawNumberEnabled && (
        <>
          <input
            type="number"
            onChange={({ target }) => setNumber(Number(target.value))}
          />
          <Button onClick={handleDrawNumber}>Draw number</Button>
        </>
      )}
    </div>
  );
};

export default HostActions;
