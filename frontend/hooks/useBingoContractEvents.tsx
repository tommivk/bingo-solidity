import { ethers } from "ethers";
import { toast } from "react-toastify";
import { Address, useContractEvent } from "wagmi";
import { BingoContractData, Ticket } from "../types";

const AddressZero = ethers.constants.AddressZero;

type Props = {
  contractData: BingoContractData;
  account: Address | undefined;
  ticket: Ticket | undefined;
  refetchFuncs: { [key: string]: Function };
};

const useBingoContractEvents = ({
  contractData,
  account,
  refetchFuncs,
  ticket,
}: Props) => {
  const {
    updateHost,
    updateIsBingo,
    updateWinners,
    updateIsWinner,
    updateDrawnNumbers,
    updateGameState,
    updateAllBingoCards,
  } = refetchFuncs;

  useContractEvent({
    ...contractData,
    eventName: "PlayerLeft",
    listener(player) {
      if (player !== account) {
        updateGameState();
        updateAllBingoCards();
      }
    },
  });

  useContractEvent({
    ...contractData,
    eventName: "HostChanged",
    listener(newHost) {
      updateHost();
      if (newHost === AddressZero) {
        return toast.info("The game host has left the game");
      }
      if (newHost === account) {
        return toast.info("You are now the game host");
      }
      toast.info("The game host has changed");
    },
  });

  useContractEvent({
    ...contractData,
    eventName: "GameStarted",
    listener() {
      updateGameState();
      toast.info("The game has started");
    },
  });

  useContractEvent({
    ...contractData,
    eventName: "NumberDrawn",
    listener(number) {
      updateDrawnNumbers();
      if (ticket && ticket.valid) {
        updateIsBingo();
      }
      updateGameState();
      toast.info(`New number drawn: ${number}`);
    },
  });

  useContractEvent({
    ...contractData,
    eventName: "TicketBought",
    listener(to) {
      if (to !== account) {
        updateAllBingoCards();
        updateGameState();
        toast.info("New player joined the game");
      }
    },
  });

  useContractEvent({
    ...contractData,
    eventName: "BingoFound",
    listener(address) {
      if (address === account) {
        toast.success("Bingo successfully called!");
      } else {
        toast.info("Bingo has been found!");
      }
      if (ticket && ticket.valid) {
        updateIsWinner();
      }
      updateGameState();
      updateWinners();
    },
  });
};

export default useBingoContractEvents;
