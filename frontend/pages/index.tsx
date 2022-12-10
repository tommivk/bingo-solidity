import Head from "next/head";
import Link from "next/link";
import { Web3Button } from "@web3modal/react";
import {
  usePrepareContractWrite,
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

const BINGO_FACTORY_ADDRESS =
  process.env.NEXT_PUBLIC_BINGO_FACTORY_ADDRESS ?? "";

const ticketCost = 200;
const maxPlayers = 5;

export default function Home() {
  const { address } = useAccount();
  const contractData: BingoFactoryContractData = {
    address: BINGO_FACTORY_ADDRESS,
    abi: [...BingoFactoryAbi] as const,
  };

  const { config } = usePrepareContractWrite({
    ...contractData,
    functionName: "createRoom",
    overrides: {
      value: ticketCost,
    },
    args: [ethers.BigNumber.from(ticketCost), maxPlayers],
  });
  const { write: createRoom } = useContractWrite({
    ...config,
    onError({ message }) {
      toast.error(parseErrorMessage(message, "Failed to create game"));
    },
    onSuccess: async (data) => {
      await data.wait();
      toast.success("New game created!");
    },
  });

  const { data, refetch: refetchRooms } = useContractRead({
    ...contractData,
    functionName: "getContracts",
  });

  useContractEvent({
    ...contractData,
    eventName: "NewRoomCreated",
    listener(creator, contractAddress, _ticketCost, _maxPlayers) {
      if (creator === address) {
        Router.push(`/games/${contractAddress}`);
      }
      refetchRooms();
    },
  });

  return (
    <div>
      <Head>
        <title>Bingo</title>
        <meta name="description" content="Bingo" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Web3Button />
      connected address: {address}
      <Button onClick={() => createRoom?.()}>Create new room</Button>
      <h1>Rooms</h1>
      <ul>
        {data
          ?.slice(0)
          .reverse()
          .map((d: string) => (
            <li key={d}>
              <Link href={`/games/${d}`}>{d}</Link>
            </li>
          ))}
      </ul>
    </div>
  );
}
