import { toast } from "react-toastify";
import { Address, useContractWrite, usePrepareContractWrite } from "wagmi";
import { BingoContractData, GameState } from "../types";
import { parseErrorMessage } from "../util";

type Props = {
  contractData: BingoContractData;
  gameState: GameState;
  account: Address | undefined;
  enabled: boolean;
  updateState: () => void;
};

const useJoinGame = ({
  contractData,
  gameState,
  account,
  enabled,
  updateState,
}: Props) => {
  const { config, error } = usePrepareContractWrite({
    ...contractData,
    functionName: "buyTicket",
    overrides: {
      value: gameState?.ticketCost,
    },
    args: account && [account],
    enabled,
  });

  const { write, isLoading: loading } = useContractWrite({
    ...config,
    onError({ message }) {
      toast.error(parseErrorMessage(message, "Failed to join the game"));
    },
    onSuccess: async (data) => {
      await data.wait();
      updateState();
      toast.success("Successfully joined");
    },
  });

  const joinGame = () => {
    if (error || !write) {
      if (error?.stack?.includes("insufficient funds")) {
        return toast.error("Insufficient funds");
      }
      return toast.error("Failed to join the game");
    }
    write();
  };

  return [joinGame, loading] as const;
};

export default useJoinGame;
