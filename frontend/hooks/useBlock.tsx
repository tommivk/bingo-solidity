import { useCallback, useEffect, useState } from "react";
import { Block } from "@ethersproject/abstract-provider";
import { Provider } from "@wagmi/core";

const useBlock = (provider?: Provider) => {
  const [data, setData] = useState<Block>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>();

  const getBlock = useCallback(async (provider: Provider) => {
    try {
      const blockNumber = await provider.getBlockNumber();
      const block = await provider.getBlock(blockNumber);
      setData(block);
      setError(false);
    } catch (error: any) {
      console.error("Error happened while fetching newest block: ", error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (provider) {
      getBlock(provider);
      provider.on("block", () => getBlock(provider));
    }
    return () => {
      provider?.removeAllListeners("block");
    };
  }, [provider, getBlock]);

  return { data, isLoading, error };
};

export default useBlock;
