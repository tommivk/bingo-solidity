import BingoCard from "./BingoCard";

type Props = {
  allBingoCards: ReadonlyArray<readonly number[]>;
  numbersDrawn: readonly number[];
};

const BingoCardList = ({ allBingoCards, numbersDrawn }: Props) => {
  return (
    <div className="max-h-[600px] overflow-auto bg-slate-800 rounded-md">
      <div className="sticky w-full top-0 py-2 bg-slate-800">
        <h1 className="text-center text-xl pt-2">
          Players: {allBingoCards.length}
        </h1>
      </div>
      <div className="flex flex-wrap h-[500px] w-[500px] max-w-[600px] gap-2 p-4">
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
