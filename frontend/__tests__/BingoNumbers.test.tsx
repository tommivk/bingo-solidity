import { render, screen } from "@testing-library/react";
import BingoNumbers from "../components/BingoNumbers";
import "@testing-library/jest-dom";

describe("BingoNumbers", () => {
  it("Marked numbers should have bg-markedNumber class", () => {
    const nums = Array.from(new Array(76).keys()).splice(1);
    const drawn = [3, 4, 5, 16, 24, 75];

    render(<BingoNumbers numbersDrawn={drawn} />);

    nums.map((num) => {
      const el = screen.getByText(num);
      if (drawn.includes(num)) {
        expect(el.className).toContain("bg-markedNumber");
      } else {
        expect(el.className).not.toContain("bg-markedNumber");
      }
    });
  });
});
