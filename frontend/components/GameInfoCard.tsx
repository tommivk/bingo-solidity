import { useState } from "react";
import BingoCardList from "./BingoCardList";
import Button from "./Button";
import BingoNumbers from "./BingoNumbers";

type Props = {
  allBingoCards: ReadonlyArray<readonly number[]>;
  numbersDrawn: readonly number[];
};

const GameInfoCard = ({ allBingoCards, numbersDrawn }: Props) => {
  const [showCards, setShowCards] = useState(true);
  return (
    <div className="flex flex-col items-center justify-between p-4 h-[600px] w-[520px] overflow-auto bg-slate-800 rounded-md">
      {showCards ? (
        <BingoCardList
          allBingoCards={allBingoCards}
          numbersDrawn={numbersDrawn}
        />
      ) : (
        <BingoNumbers numbersDrawn={numbersDrawn} />
      )}

      <div className="flex gap-2">
        <Button onClick={() => setShowCards(true)} disabled={showCards}>
          All cards
        </Button>
        <Button onClick={() => setShowCards(false)} disabled={!showCards}>
          Numbers drawn
        </Button>
      </div>
    </div>
  );
};

export default GameInfoCard;
