import { useState } from "react";
import BingoCardList from "./BingoCardList";
import Button from "./Button";
import BingoNumbers from "./BingoNumbers";
import { Address } from "wagmi";
import WinnerList from "./WinnerList";

type Props = {
  winners: ReadonlyArray<Address>;
  allBingoCards: ReadonlyArray<readonly number[]>;
  numbersDrawn: readonly number[];
};

const GameInfoCard = ({ allBingoCards, numbersDrawn, winners }: Props) => {
  const [tab, setTab] = useState(0);

  return (
    <div className="flex flex-col items-center justify-between p-4 h-[600px] w-[520px] overflow-auto bg-slate-800 rounded-md">
      {tab === 0 && (
        <BingoCardList
          allBingoCards={allBingoCards}
          numbersDrawn={numbersDrawn}
        />
      )}
      {tab === 1 && <BingoNumbers numbersDrawn={numbersDrawn} />}
      {tab === 2 && <WinnerList winners={winners} />}

      <div className="flex gap-2">
        <Button onClick={() => setTab(0)} disabled={tab === 0}>
          All cards
        </Button>
        <Button onClick={() => setTab(1)} disabled={tab === 1}>
          Numbers drawn
        </Button>
        {winners.length > 0 && (
          <Button onClick={() => setTab(2)} disabled={tab === 2}>
            Winners
          </Button>
        )}
      </div>
    </div>
  );
};

export default GameInfoCard;
