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
import Input from "../components/Input";

const BINGO_FACTORY_ADDRESS =
  process.env.NEXT_PUBLIC_BINGO_FACTORY_ADDRESS ?? "";

export default function Home() {
  const { address } = useAccount();

  const [modalOpen, setModalOpen] = useState(false);
  const [ticketCost, setTicketCost] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("5");

  const contractData: BingoFactoryContractData = {
    address: BINGO_FACTORY_ADDRESS,
    abi: [...BingoFactoryAbi] as const,
  };

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
    onError({ message }) {
      toast.error(parseErrorMessage(message, "Failed to create game"));
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
    try {
      createRoom?.();
    } catch (_error) {
      toast.error("Failed to create game");
    }
  };

  const handleTicketCostChange = (event: any) => {
    const value = event.target.value;
    if (isNaN(value)) {
      return toast.error("Invalid number");
    }
    setTicketCost(value);
  };

  const handleMaxPlayersChange = (event: any) => {
    const value = event.target.value;

    if (isNaN(value)) {
      return toast.error("Invalid number");
    }
    setMaxPlayers(value);
  };

  return (
    <div>
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
                    onChange={handleTicketCostChange}
                  />
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
                    type="number"
                    value={maxPlayers}
                    onChange={handleMaxPlayersChange}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </Modal.Content>
        <Modal.Footer>
          <Button
            onClick={handleCreateGame}
            loading={createRoomLoading}
            disabled={!ticketCost || !maxPlayers}
          >
            Create game
          </Button>
        </Modal.Footer>
      </Modal>
      <Head>
        <title>Bingo</title>
        <meta name="description" content="Bingo" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Web3Button />
      Connected address: {address}
      <Button onClick={() => setModalOpen(true)}>Create a New Game</Button>
      <RoomList rooms={rooms} />
    </div>
  );
}
