import { useState } from "react";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { BingoContractData, GameState } from "../types";
import { GameStatus } from "../constants";
import Button from "./Button";

type Props = {
  gameState: GameState;
  contractData: BingoContractData;
};

const HostActions = ({ contractData, gameState }: Props) => {
  const [number, setNumber] = useState(1);

  const { config: startGameConfig } = usePrepareContractWrite({
    ...contractData,
    functionName: "startGame",
    enabled: gameState?.gameStatus == 0 ? true : false,
  });
  const { write: startGame } = useContractWrite(startGameConfig);

  const { config: drawNumberConfig } = usePrepareContractWrite({
    ...contractData,
    functionName: "drawNumber",
    args: [number],
    enabled: gameState?.gameStatus === GameStatus.RUNNING,
  });
  const { write: drawNumber } = useContractWrite(drawNumberConfig);

  return (
    <div>
      {gameState.gameStatus == GameStatus.SETUP && (
        <Button onClick={() => startGame?.()}>Start game</Button>
      )}

      {gameState.gameStatus == GameStatus.RUNNING && (
        <>
          <input
            type="number"
            onChange={({ target }) => setNumber(Number(target.value))}
          />
          <Button onClick={() => drawNumber?.()}>Draw number</Button>
        </>
      )}
    </div>
  );
};

export default HostActions;
