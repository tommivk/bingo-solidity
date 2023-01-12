import { useEffect, useState } from "react";

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
      } box-content bg-slate-800 max-w-[100vw] grid grid-cols-5 gap-2 select-none`}
    >
      {card.map((num: number | string, index) => (
        <div
          key={index}
          className={`${
            size === "large" ? "p-5" : "p-1"
          } bg-slate-700 text-slate-200 flex items-center justify-center ${
            markedNumbers[index] || index == 12 ? "bg-red-500" : ""
          }`}
        >
          {index == 12 ? (
            <span className="text-xl text-yellow-400">*</span>
          ) : (
            num
          )}
        </div>
      ))}
    </div>
  );
};

export default BingoCard;
