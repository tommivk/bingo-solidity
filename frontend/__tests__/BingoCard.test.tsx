import { render, screen } from "@testing-library/react";
import BingoCard from "../components/BingoCard";
import "@testing-library/jest-dom";

describe("BingoCard", () => {
  it("Marked numbers should have bg-markedNumber class", () => {
    const nums = Array.from(Array(25).keys());
    const drawn = [3, 4, 5, 16, 24];

    render(<BingoCard card={nums} numbersDrawn={drawn} />);

    const card = screen.getByTestId("bingo-card");
    expect(card.children.length).toBe(25);

    const wildCard = card.children[12];
    expect(wildCard.className).toContain("bg-markedNumber");

    nums.map((num) => {
      if (num !== 12) {
        const el = screen.getByText(num);
        if (drawn.includes(num)) {
          expect(el.className).toContain("bg-markedNumber");
        } else {
          expect(el.className).not.toContain("bg-markedNumber");
        }
      }
    });
  });
});
