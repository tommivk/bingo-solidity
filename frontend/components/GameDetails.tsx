import { Address, useContractWrite, usePrepareContractWrite } from "wagmi";
import { BingoContractData, GameState, Ticket } from "../types";
import { ethers } from "ethers";
import Button from "./Button";

type Props = {
  host: Address;
  isHost: boolean;
  playersJoined?: number;
  gameState: GameState;
  contractData: BingoContractData;
  ticket?: Ticket;
};

const GameDetails = ({
  gameState,
  host,
  isHost,
  contractData,
  ticket,
}: Props) => {
  const { maxPlayers, playersJoined, gameStatus } = gameState;
  const AddressZero = ethers.constants.AddressZero;

  const claimHostEnabled = host === AddressZero && ticket?.valid;

  const { config } = usePrepareContractWrite({
    ...contractData,
    functionName: "claimHost",
    enabled: claimHostEnabled,
  });
  const { write: claimHost } = useContractWrite(config);

  return (
    <div>
      <div>
        <p>Game address {contractData.address}</p>
        Host: {host} {isHost && "(You)"}
        {claimHostEnabled && (
          <Button onClick={() => claimHost?.()}>Claim host</Button>
        )}
      </div>
      <div>Players joined: {playersJoined}</div>
      <div>Max Players: {maxPlayers}</div>
      <div>GameStatus: {gameStatus}</div>
    </div>
  );
};

export default GameDetails;
