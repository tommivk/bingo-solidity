import Link from "next/link";
import {
  useContractRead,
  useAccount,
  useContractEvent,
  useProvider,
  useNetwork,
  useBalance,
} from "wagmi";
import { GetServerSidePropsContext } from "next";
import { abi } from "../../abi/Bingo";
import BingoCard from "../../components/BingoCard";
import GameDetails from "../../components/GameDetails";
import Button from "../../components/Button";
import HostActions from "../../components/HostActions";
import { ethers } from "ethers";
import { BingoContractData } from "../../types";
import { toast } from "react-toastify";
import PlayerActions from "../../components/PlayerActions";
import GameInfoCard from "../../components/GameInfoCard";
import WrongNetworkError from "../../components/WrongNetworkError";
import useBlock from "../../hooks/useBlock";
import ErrorPage from "../../components/ErrorPage";
import AccountButtons from "../../components/AccountButtons";

const AddressZero = ethers.constants.AddressZero;
const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID);

const Game = ({ contractAddress }: { contractAddress: string }) => {
  const { address: account } = useAccount();
  const { data: balance } = useBalance({
    address: account,
  });
  const provider = useProvider();
  const {
    data: block,
    isLoading: blockLoading,
    error: blockError,
  } = useBlock(provider);

  const { chain } = useNetwork();

  const contractData: BingoContractData = {
    address: contractAddress,
    abi: [...abi] as const,
  };

  const {
    data: gameState,
    refetch: updateGameState,
    error: gameStateError,
    isLoading: gameStateLoading,
  } = useContractRead({
    ...contractData,
    functionName: "getGame",
  });

  const {
    data: host,
    refetch: updateHost,
    error: hostError,
    isLoading: hostLoading,
  } = useContractRead({
    ...contractData,
    functionName: "host",
  });

  const {
    data: gameFee,
    isLoading: gameFeeLoading,
    error: gameFeeError,
  } = useContractRead({
    ...contractData,
    functionName: "gameFee",
  });

  const {
    data: ticket,
    refetch: updateTicket,
    isLoading: ticketLoading,
    error: ticketError,
  } = useContractRead({
    ...contractData,
    functionName: "getTicket",
    overrides: {
      from: account,
    },
    args: account && [account],
    enabled: !!account,
  });

  const {
    data: allBingoCards = [],
    refetch: updateAllBingoCards,
    isLoading: allBingoCardsLoading,
    error: allBingoCardsError,
  } = useContractRead({
    ...contractData,
    functionName: "getBingoCards",
  });

  const {
    data: numbersDrawn = [],
    refetch: updateDrawnNumbers,
    isLoading: numbersDrawnLoading,
    error: numbersDrawnError,
  } = useContractRead({
    ...contractData,
    functionName: "getDrawnNumbers",
  });

  const {
    data: isWinner = false,
    refetch: updateIsWinner,
    isLoading: isWinnerLoading,
    error: isWinnerError,
  } = useContractRead({
    ...contractData,
    functionName: "winners",
    args: account && [account],
    enabled: !!account,
  });

  const {
    data: isBingo = false,
    refetch: updateIsBingo,
    isLoading: isBingoLoading,
    error: isBingoError,
  } = useContractRead({
    ...contractData,
    functionName: "checkBingo",
    args: ticket && [ticket.card],
    enabled: !!ticket,
  });

  const {
    data: winners = [],
    refetch: updateWinners,
    isLoading: winnersLoading,
    error: winnersError,
  } = useContractRead({
    ...contractData,
    functionName: "getWinners",
  });

  useContractEvent({
    ...contractData,
    eventName: "PlayerLeft",
    listener(player, _event) {
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

  if (
    gameStateError ||
    hostError ||
    ticketError ||
    allBingoCardsError ||
    numbersDrawnError ||
    isWinnerError ||
    isBingoError ||
    winnersError ||
    gameFeeError ||
    (!block && blockError)
  ) {
    return <ErrorPage errorCode={500} errorText={"Internal server error"} />;
  }

  if (
    gameStateLoading ||
    hostLoading ||
    blockLoading ||
    ticketLoading ||
    allBingoCardsLoading ||
    numbersDrawnLoading ||
    isWinnerLoading ||
    isBingoLoading ||
    winnersLoading ||
    blockLoading ||
    gameFeeLoading ||
    !block
  ) {
    return (
      <div className="h-screen w-screen text-center flex flex-col justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!gameState || !host || !gameFee) {
    return <ErrorPage errorCode={500} errorText={"Internal server error"} />;
  }

  const isHost = !!account && account === host;

  return (
    <div className="min-h-screen flex flex-col justify-between relative">
      {chain && chain.id !== CHAIN_ID && <WrongNetworkError />}
      <div>
        <div className="flex flex-wrap mt-4 mx-4 gap-4 justify-between items-center">
          <Link href={"/"}>
            <Button className="">All games</Button>
          </Link>
          <AccountButtons
            className="inline-block"
            address={account}
            balance={balance}
          />
        </div>

        <GameDetails
          gameState={gameState}
          host={host}
          isHost={isHost}
          contractData={contractData}
          ticket={ticket}
        />
        <div className="flex justify-evenly flex-wrap gap-4 mt-10 mb-2">
          <BingoCard
            card={
              ticket && ticket.valid
                ? ticket.card
                : Array.from("BINGO".repeat(5))
            }
            numbersDrawn={numbersDrawn}
          />
          <GameInfoCard
            gameState={gameState}
            allBingoCards={allBingoCards}
            numbersDrawn={numbersDrawn}
            winners={winners}
            gameFee={gameFee}
          />
        </div>
      </div>
      <div>
        {isHost && (
          <HostActions gameState={gameState} contractData={contractData} />
        )}
        <PlayerActions
          contractData={contractData}
          account={account}
          gameState={gameState}
          ticket={ticket}
          updateTicket={updateTicket}
          updateDrawnNumbers={updateDrawnNumbers}
          updateAllBingoCards={updateAllBingoCards}
          updateIsBingo={updateIsBingo}
          updateGameState={updateGameState}
          isBingo={isBingo}
          isWinner={isWinner}
          block={block}
        />
      </div>
    </div>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { contractAddress } = context.query;
  return { props: { contractAddress } };
};

export default Game;
