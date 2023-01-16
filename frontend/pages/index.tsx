import Head from "next/head";
import { Web3Button } from "@web3modal/react";
import {
  useContractWrite,
  useContractRead,
  useAccount,
  useContractEvent,
} from "wagmi";
import { ethers } from "ethers";
import { abi as BingoFactoryAbi } from "../abi/BingoFactory";
import { BingoFactoryContractData } from "../types";
import Button from "../components/Button";
import { toast } from "react-toastify";
import { parseErrorMessage } from "../util";
import Router from "next/router";
import RoomList from "../components/RoomList";
import Modal from "../components/Modal";
import { useState } from "react";
import { useBalance } from "wagmi";
import { useNetwork } from "wagmi";
import Input from "../components/Input";
import Dropdown from "../components/Dropdown";
import WrongNetworkError from "../components/WrongNetworkError";

const BINGO_FACTORY_ADDRESS =
  process.env.NEXT_PUBLIC_BINGO_FACTORY_ADDRESS ?? "";
const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID);

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [ticketCost, setTicketCost] = useState("0");
  const [maxPlayers, setMaxPlayers] = useState("5");
  const [maxPlayersError, setMaxPlayersError] = useState("");
  const [ticketCostError, setTicketCostError] = useState("");

  const contractData: BingoFactoryContractData = {
    address: BINGO_FACTORY_ADDRESS,
    abi: [...BingoFactoryAbi] as const,
  };

  const { address } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });
  const { chain } = useNetwork();

  const { write: createRoom, isLoading: createRoomLoading } = useContractWrite({
    ...contractData,
    mode: "recklesslyUnprepared",
    functionName: "createRoom",
    overrides: {
      value: ticketCost
        ? ethers.utils.parseUnits(ticketCost, "ether")
        : undefined,
    },
    args:
      ticketCost && maxPlayers
        ? [ethers.utils.parseUnits(ticketCost, "ether"), Number(maxPlayers)]
        : undefined,
    onError({ message, stack }) {
      toast.error(
        parseErrorMessage(stack) ??
          parseErrorMessage(message, "Failed to create game")
      );
    },
    onSuccess() {
      setModalOpen(false);
    },
  });

  const { data: rooms, refetch: refetchRooms } = useContractRead({
    ...contractData,
    functionName: "getContracts",
  });

  useContractEvent({
    ...contractData,
    eventName: "NewRoomCreated",
    listener(creator, contractAddress, _ticketCost, _maxPlayers) {
      if (creator === address) {
        Router.push(`/games/${contractAddress}`);
        toast.success("New game created!");
      }
      refetchRooms();
    },
  });

  const handleCreateGame = () => {
    if (!ticketCost) {
      return setTicketCostError("Ticket cost is required");
    }
    if (!maxPlayers) {
      return setMaxPlayersError("Max players is required");
    }

    try {
      createRoom?.();
    } catch (_error) {
      toast.error("Failed to create game");
    }
  };

  const handleTicketCostChange = (event: any) => {
    const value = event.target.value;
    setTicketCost(value);
    if (value < 0) {
      return setTicketCostError("Value must be positive");
    }
    setTicketCostError("");
  };

  const handleMaxPlayersChange = (event: any) => {
    const value = event.target.value;
    setMaxPlayers(value);
    if (value && (value < 1 || value > 255)) {
      return setMaxPlayersError("Value must be between 1 and 255");
    }
    setMaxPlayersError("");
  };

  const { data: vrfId } = useContractRead({
    ...contractData,
    functionName: "vrfSubscriptionId",
  });
  console.log("VRF ID:", vrfId?.toString());

  return (
    <div>
      <Head>
        <title>Bingo</title>
        <meta name="description" content="Bingo" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {chain && chain.id !== CHAIN_ID && <WrongNetworkError />}

      <div className="p-4 flex justify-end items-center flex-wrap gap-2">
        {address && balance ? (
          <Dropdown address={address} balance={balance} />
        ) : (
          <Web3Button />
        )}
      </div>
      <div className="flex flex-col justify-center items-center">
        {address && (
          <Button className="mb-5" onClick={() => setModalOpen(true)}>
            Create a New Game
          </Button>
        )}
        <RoomList rooms={rooms} />
      </div>

      <Modal open={modalOpen} setModalOpen={setModalOpen}>
        <Modal.Header>Create a New Game</Modal.Header>
        <Modal.Content>
          <table>
            <tbody>
              <tr>
                <th className="text-left pb-1">Bet</th>
              </tr>
              <tr>
                <td>
                  <Input
                    type="number"
                    value={ticketCost}
                    min={0}
                    step={0.000001}
                    onChange={handleTicketCostChange}
                    allowNegative={false}
                  />
                  {ticketCostError && (
                    <p className="text-red-500 text-center pt-1 text-sm">
                      {ticketCostError}
                    </p>
                  )}
                </td>
                <td className="font-semibold pl-2">ETH</td>
              </tr>
              <tr className="h-2" />
              <tr>
                <th className="text-left pb-1">Max players</th>
              </tr>
              <tr>
                <td>
                  <Input
                    className="w-full"
                    type="number"
                    value={maxPlayers}
                    min={1}
                    max={255}
                    onChange={handleMaxPlayersChange}
                    allowNegative={false}
                    allowDecimals={false}
                  />
                  {maxPlayersError && (
                    <p className="text-red-500 text-center pt-1 text-sm">
                      {maxPlayersError}
                    </p>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </Modal.Content>
        <Modal.Footer>
          <Button
            onClick={handleCreateGame}
            loading={createRoomLoading}
            disabled={!!ticketCostError || !!maxPlayersError}
          >
            Create game
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
