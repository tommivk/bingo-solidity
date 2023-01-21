type Props = {
  numbersDrawn: readonly number[];
};

const BingoNumbers = ({ numbersDrawn }: Props) => {
  return (
    <div className="overflow-auto">
      <h1 className="text-center text-xl mb-2 sticky w-full top-0 py-2 bg-slate-800">
        Total Drawn: {numbersDrawn.length}
      </h1>
      <div className="flex flex-wrap max-w-[400px] gap-2 my-auto select-none">
        {Array.from(new Array(76).keys())
          .splice(1)
          .map((num) => (
            <div
              key={num}
              className={`${
                numbersDrawn.includes(num) ? "bg-markedNumber" : "bg-slate-700"
              }  p-2 rounded-full flex justify-center items-center w-[24px] h-[24px] xxs:w-[27px] xxs:h-[27px]  xs:w-[35px] xs:h-[35px]`}
            >
              {num}
            </div>
          ))}
      </div>
    </div>
  );
};

export default BingoNumbers;
