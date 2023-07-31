import { useEffect, useState } from "react";

const StarIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 260 245"
      className={className}
    >
      <path d="m56,237 74-228 74,228L10,96h240" />
    </svg>
  );
};

type Props = {
  card: readonly (number | string)[];
  numbersDrawn: readonly number[];
  size?: "small" | "large";
};

const BingoCard = ({ card, numbersDrawn, size = "large" }: Props) => {
  const [markedNumbers, setMarkedNumbers] = useState(Array(25).fill(false));

  useEffect(() => {
    const newmarkedNumbers = Array(25).fill(false);

    numbersDrawn.map((num) => {
      if (card.includes(num)) {
        const numIndex = card.indexOf(num);
        newmarkedNumbers[numIndex] = true;
      }
    });

    setMarkedNumbers(newmarkedNumbers);
  }, [card, numbersDrawn]);

  return (
    <div
      data-testid="bingo-card"
      className={`${
        size === "large" ? "w-[400px] h-[400px] p-6" : "w-[200px] h-[200px] p-2"
      } box-border bg-slate-800 max-w-[90vw] max-h-[90vw] grid grid-cols-5 gap-2 select-none aspect-square`}
    >
      {card.map((num: number | string, index) => (
        <div
          key={index}
          className={`aspect-square text-slate-200 flex items-center justify-center ${
            markedNumbers[index] || index == 12
              ? "bg-markedNumber"
              : "bg-slate-700"
          }`}
        >
          {index == 12 ? (
            <StarIcon className={"fill-yellow-400 h-[80%] w-[80%]"} />
          ) : (
            num
          )}
        </div>
      ))}
    </div>
  );
};

export default BingoCard;
