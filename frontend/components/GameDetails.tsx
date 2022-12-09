import { Address } from "wagmi";
import { GameState } from "../types";

type Props = {
  host: Address;
  isHost: boolean;
  contractAddress: string;
  playersJoined?: number;
  gameState: GameState;
};

const GameDetails = ({ gameState, host, isHost, contractAddress }: Props) => {
  const { maxPlayers, playersJoined, gameStatus } = gameState;

  return (
    <div>
      <div>
        <p>Game address {contractAddress}</p>
        Host: {host} {isHost && "(You)"}
      </div>
      <div>Players joined: {playersJoined}</div>
      <div>Max Players: {maxPlayers}</div>
      <div>GameStatus: {gameStatus}</div>
    </div>
  );
};

export default GameDetails;
