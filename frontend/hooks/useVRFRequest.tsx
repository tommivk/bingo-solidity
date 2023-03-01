import { useContractEvent } from "wagmi";
import { ethers } from "ethers";
import { useState } from "react";
import { BingoContractData } from "../types";

type Props = {
  contractData: BingoContractData;
  updateState: () => void;
};

const useVRFRequest = ({ contractData, updateState }: Props) => {
  const [vrfRequest, setVrfRequest] = useState<{
    requested: boolean;
    fulfilled: boolean;
    requestId?: ethers.BigNumber;
  }>({
    requested: false,
    fulfilled: false,
    requestId: undefined,
  });

  useContractEvent({
    ...contractData,
    eventName: "VRFRequested",
    listener(vrfRequestId) {
      if (vrfRequest.requestId && !vrfRequest.fulfilled) {
        console.error("VRF event missed");
        updateState();
      }
      setVrfRequest({
        requestId: vrfRequestId,
        fulfilled: false,
        requested: true,
      });
    },
  });

  useContractEvent({
    ...contractData,
    eventName: "VRFFulfilled",
    listener(vrfRequestId) {
      if (vrfRequest.requestId && !vrfRequest.requestId.eq(vrfRequestId)) {
        console.error("VRF event missed");
        updateState();
      }
      setVrfRequest({ ...vrfRequest, fulfilled: true, requested: false });
    },
  });

  return [vrfRequest] as const;
};

export default useVRFRequest;
