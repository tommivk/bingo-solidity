import { toast } from "react-toastify";
import { usePrepareContractWrite, useContractWrite, Address } from "wagmi";
import { BingoContractData } from "../types";
import { parseErrorMessage } from "../util";

type Props = {
  contractData: BingoContractData;
  account: Address | undefined;
  enabled: boolean;
};
const useCallBingo = ({ contractData, account, enabled }: Props) => {
  const { config, error } = usePrepareContractWrite({
    ...contractData,
    functionName: "callBingo",
    overrides: {
      from: account,
    },
    enabled,
  });

  const { write, isLoading: loading } = useContractWrite({
    ...config,
    onError({ message }) {
      toast.error(parseErrorMessage(message, "Failed to call bingo"));
    },
    onSuccess: async (data) => {
      await data.wait();
    },
  });

  const callBingo = () => {
    if (error || !write) {
      return toast.error("Failed to call bingo");
    }
    write?.();
  };

  return [callBingo, loading] as const;
};

export default useCallBingo;
