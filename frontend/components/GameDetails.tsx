import { Address, useContractWrite, usePrepareContractWrite } from "wagmi";
import { BingoContractData, GameState, Ticket } from "../types";
import { ethers } from "ethers";
import Button from "./Button";
import { toast } from "react-toastify";
import { gameStatusToString, parseErrorMessage } from "../util";

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
  const { minPlayers, maxPlayers, joinedPlayers } = gameState;
  const AddressZero = ethers.constants.AddressZero;

  const claimHostEnabled = host === AddressZero && !!ticket && ticket.valid;

  const { config: claimHostConfig, error: prepareDrawHostError } =
    usePrepareContractWrite({
      ...contractData,
      functionName: "claimHost",
      enabled: claimHostEnabled,
    });

  const { write: claimHost, isLoading: claimHostLoading } = useContractWrite({
    ...claimHostConfig,
    onError({ message }) {
      toast.error(parseErrorMessage(message, "Failed to claim host"));
    },
  });

  const handleClaimHost = () => {
    if (prepareDrawHostError) {
      toast.error("Error");
    }
    claimHost?.();
  };

  return (
    <div className="pt-4 px-4 text-slate-300 text-sm">
      <p>
        Game address: <span className="break-all">{contractData.address}</span>
      </p>
      Host: <span className="break-all">{host}</span> {isHost && "(You)"}
      {claimHostEnabled && (
        <Button onClick={handleClaimHost} loading={claimHostLoading}>
          Claim host
        </Button>
      )}
      <div>
        <p>
          Players joined: {joinedPlayers.length} / {maxPlayers}
        </p>
        <p>Min players: {minPlayers}</p>
        <p>Game status: {gameStatusToString(gameState)}</p>
      </div>
    </div>
  );
};

export default GameDetails;
