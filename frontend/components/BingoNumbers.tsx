type Props = {
  numbersDrawn: readonly number[];
};

const BingoNumbers = ({ numbersDrawn }: Props) => {
  return (
    <div className="flex flex-wrap max-w-[400px] gap-2 my-auto select-none">
      {Array.from(new Array(76).keys())
        .splice(1)
        .map((num) => (
          <div
            key={num}
            className={`${
              numbersDrawn.includes(num) ? "bg-red-500" : "bg-slate-700"
            }  p-2 rounded-full flex justify-center items-center w-[35px] h-[35px]`}
          >
            {num}
          </div>
        ))}
    </div>
  );
};

export default BingoNumbers;
