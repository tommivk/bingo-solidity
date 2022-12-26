import BingoCard from "./BingoCard";

type Props = {
  allBingoCards: ReadonlyArray<readonly number[]>;
  numbersDrawn: readonly number[];
};

const BingoCardList = ({ allBingoCards, numbersDrawn }: Props) => {
  return (
    <div className="w-full overflow-auto h-[500px] bg-slate-800 rounded-md">
      <div className="sticky w-full top-0 py-2 bg-slate-800">
        <h1 className="text-center text-xl">Players: {allBingoCards.length}</h1>
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
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
