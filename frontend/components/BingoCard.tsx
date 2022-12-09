import { useEffect, useState } from "react";

type Props = {
  card: readonly number[];
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
      className={`${
        size === "large" ? "w-[500px] p-10" : "w-[250px] p-4"
      } bg-slate-800 max-w-[100vw] grid grid-cols-5 gap-2 select-none`}
    >
      {card.map((num: number, index) => (
        <div
          key={num}
          className={`${
            size === "large" ? "p-5" : "p-2"
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
