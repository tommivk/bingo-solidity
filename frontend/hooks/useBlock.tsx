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
      if (!block) throw "Block was undefined";
      setData(block);
      setError(false);
    } catch (error: any) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (provider) {
      provider.on("block", () => getBlock(provider));
    }
  }, [provider, getBlock]);

  return { data, isLoading, error };
};

export default useBlock;
