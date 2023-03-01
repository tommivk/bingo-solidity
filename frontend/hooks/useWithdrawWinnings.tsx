import { toast } from "react-toastify";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { BingoContractData } from "../types";
import { parseErrorMessage } from "../util";

type Props = {
  contractData: BingoContractData;
  enabled: boolean;
  updateState: () => void;
};
const useWithdrawWinnings = ({ contractData, enabled, updateState }: Props) => {
  const { config, error, refetch } = usePrepareContractWrite({
    ...contractData,
    functionName: "withdrawWinnings",
    enabled,
  });

  const { write, isLoading: loading } = useContractWrite({
    ...config,
    onError({ message }) {
      toast.error(parseErrorMessage(message, "Failed to withdraw"));
    },
    onSuccess: async (data) => {
      await data.wait();
      updateState();
      toast.success("Successfully withdrawed!");
    },
  });

  const withdrawWinnings = async () => {
    await refetch();
    if (error || !write) {
      return toast.error("Failed to withdraw");
    }
    write();
  };

  return [withdrawWinnings, loading] as const;
};

export default useWithdrawWinnings;
