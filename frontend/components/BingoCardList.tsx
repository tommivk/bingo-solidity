import BingoCard from "./BingoCard";

type Props = {
  allBingoCards: ReadonlyArray<readonly number[]>;
  numbersDrawn: readonly number[];
};

const BingoCardList = ({ allBingoCards, numbersDrawn }: Props) => {
  return (
    <div className="max-h-[600px] overflow-auto">
      <div className="bg-slate-800 flex flex-wrap max-w-[600px] gap-2">
        {allBingoCards.map((card, index) => (
          <div key={index}>
            <BingoCard size="small" card={card} numbersDrawn={numbersDrawn} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BingoCardList;
