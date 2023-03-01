import Link from "next/link";
import { useAccount, useProvider, useNetwork, useBalance } from "wagmi";
import { GetServerSidePropsContext } from "next";
import { abi } from "../../abi/Bingo";
import BingoCard from "../../components/BingoCard";
import GameDetails from "../../components/GameDetails";
import Button from "../../components/Button";
import HostActions from "../../components/HostActions";
import { BingoContractData } from "../../types";
import PlayerActions from "../../components/PlayerActions";
import GameInfoCard from "../../components/GameInfoCard";
import WrongNetworkError from "../../components/WrongNetworkError";
import useBlock from "../../hooks/useBlock";
import ErrorPage from "../../components/ErrorPage";
import AccountButtons from "../../components/AccountButtons";
import useBingoContractReads from "../../hooks/useBingoContractReads";
import useBingoContractEvents from "../../hooks/useBingoContractEvents";

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

  const [data, loading, refetchFuncs, error] = useBingoContractReads(
    account,
    contractData
  );

  const {
    gameState,
    host,
    gameFee,
    allBingoCards,
    numbersDrawn,
    isBingo,
    isWinner,
    winners,
    ticket,
  } = data;

  const {
    updateGameState,
    updateAllBingoCards,
    updateDrawnNumbers,
    updateIsBingo,
    updateTicket,
  } = refetchFuncs;

  useBingoContractEvents({ contractData, account, ticket, refetchFuncs });

  if (error || (!block && blockError)) {
    return <ErrorPage errorCode={500} errorText={"Internal server error"} />;
  }

  if (loading || blockLoading || !block) {
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
