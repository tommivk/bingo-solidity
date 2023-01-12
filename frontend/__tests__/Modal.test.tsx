import { fireEvent, render, screen } from "@testing-library/react";
import Modal from "../components/Modal";
import "@testing-library/jest-dom";

describe("Modal", () => {
  it("Renders children", () => {
    const setModalOpen = jest.fn();
    render(
      <Modal open={true} setModalOpen={setModalOpen}>
        <Modal.Header>Header</Modal.Header>
        <Modal.Content>Content</Modal.Content>
        <Modal.Footer>Footer</Modal.Footer>
      </Modal>
    );
    screen.getByText("Header");
    screen.getByText("Content");
    screen.getByText("Footer");
  });

  it("Button passed to footer is clickable", () => {
    const setModalOpen = jest.fn();
    const btnFn = jest.fn();
    render(
      <Modal open={true} setModalOpen={setModalOpen}>
        <Modal.Header>Header</Modal.Header>
        <Modal.Content>Content</Modal.Content>
        <Modal.Footer>
          <button onClick={btnFn}>click me</button>
        </Modal.Footer>
      </Modal>
    );
    const btn = screen.getByText("click me");
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(btnFn).toBeCalledTimes(2);
  });

  it("Clicking close button fires setModalOpen", () => {
    const setModalOpen = jest.fn();
    render(
      <Modal open={true} setModalOpen={setModalOpen}>
        <Modal.Header>Header</Modal.Header>
        <Modal.Content>Content</Modal.Content>
        <Modal.Footer>Footer</Modal.Footer>
      </Modal>
    );
    const closeBtn = screen.getByTestId("modal-close-btn");
    fireEvent.click(closeBtn);
    expect(setModalOpen).toBeCalledWith(false);
    expect(setModalOpen).toBeCalledTimes(1);
  });
});
