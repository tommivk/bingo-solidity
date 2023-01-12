import { fireEvent, render, screen } from "@testing-library/react";
import Button from "../components/Button";
import "@testing-library/jest-dom";

describe("Button", () => {
  it("Renders children", () => {
    render(<Button>Button text</Button>);
    screen.getByText("Button text");
  });

  it("Fires a function that is passed to onClick", () => {
    const jestFn = jest.fn();
    render(<Button onClick={jestFn}>Content</Button>);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(jestFn).toBeCalledTimes(1);
  });
});
