import Head from "next/head";
import { useContractRead, useAccount, useContractEvent } from "wagmi";
import { abi as BingoFactoryAbi } from "../abi/BingoFactory";
import { BingoFactoryContractData } from "../types";
import Button from "../components/Button";
import { toast } from "react-toastify";
import Router from "next/router";
import RoomList from "../components/RoomList";
import Modal from "../components/Modal";
import { useState } from "react";
import { useBalance } from "wagmi";
import { useNetwork } from "wagmi";
import WrongNetworkError from "../components/WrongNetworkError";
import AccountButtons from "../components/AccountButtons";
import NewGameForm from "../components/NewGameForm";

const BINGO_FACTORY_ADDRESS =
  process.env.NEXT_PUBLIC_BINGO_FACTORY_ADDRESS ?? "";
const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID);

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);

  const contractData: BingoFactoryContractData = {
    address: BINGO_FACTORY_ADDRESS,
    abi: [...BingoFactoryAbi] as const,
  };

  const { address } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });
  const { chain } = useNetwork();

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

      <AccountButtons
        className="flex justify-end p-4 lg:fixed top-0 right-0"
        address={address}
        balance={balance}
      />

      <div className="lg:mt-20 flex flex-col justify-center items-center">
        {address && (
          <Button className="mb-5" onClick={() => setModalOpen(true)}>
            Create a New Game
          </Button>
        )}
        <RoomList rooms={rooms} />
      </div>

      <Modal open={modalOpen} setModalOpen={setModalOpen}>
        <Modal.Content>
          <NewGameForm
            contractData={contractData}
            setModalOpen={setModalOpen}
          />
        </Modal.Content>
      </Modal>
    </div>
  );
}
