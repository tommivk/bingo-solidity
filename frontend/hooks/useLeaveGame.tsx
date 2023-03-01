import { toast } from "react-toastify";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { BingoContractData } from "../types";
import { parseErrorMessage } from "../util";

type Props = {
  contractData: BingoContractData;
  enabled: boolean;
  updateState: () => void;
};

const useLeaveGame = ({ contractData, enabled, updateState }: Props) => {
  const { config, error } = usePrepareContractWrite({
    ...contractData,
    functionName: "leaveGame",
    enabled,
  });

  const { write, isLoading: loading } = useContractWrite({
    ...config,
    onError({ message }) {
      toast.error(parseErrorMessage(message, "Failed to leave the game"));
    },
    onSuccess: async (data) => {
      await data.wait();
      updateState();
      toast.success("Successfully left the game");
    },
  });

  const leaveGame = () => {
    if (error || !write) {
      return toast.error("Failed to leave the game");
    }
    write();
  };

  return [leaveGame, loading] as const;
};

export default useLeaveGame;
