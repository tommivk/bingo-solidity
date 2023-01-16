import { useState } from "react";
import { toast } from "react-toastify";
import { useContractWrite } from "wagmi";
import { BingoContractData } from "../types";
import { parseErrorMessage } from "../util";
import Button from "./Button";
import Modal from "./Modal";

const SettingsIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <path d="M20.991,10H19.42a1.039,1.039,0,0,1-.951-.674l-.005-.013a1.04,1.04,0,0,1,.2-1.146l1.11-1.11a1.01,1.01,0,0,0,0-1.428l-1.4-1.4a1.01,1.01,0,0,0-1.428,0l-1.11,1.11a1.04,1.04,0,0,1-1.146.2l-.013,0A1.04,1.04,0,0,1,14,4.579V3.009A1.009,1.009,0,0,0,12.991,2H11.009A1.009,1.009,0,0,0,10,3.009v1.57a1.04,1.04,0,0,1-.674.952l-.013,0a1.04,1.04,0,0,1-1.146-.2l-1.11-1.11a1.01,1.01,0,0,0-1.428,0l-1.4,1.4a1.01,1.01,0,0,0,0,1.428l1.11,1.11a1.04,1.04,0,0,1,.2,1.146l0,.013A1.039,1.039,0,0,1,4.58,10H3.009A1.009,1.009,0,0,0,2,11.009v1.982A1.009,1.009,0,0,0,3.009,14H4.58a1.039,1.039,0,0,1,.951.674l0,.013a1.04,1.04,0,0,1-.2,1.146l-1.11,1.11a1.01,1.01,0,0,0,0,1.428l1.4,1.4a1.01,1.01,0,0,0,1.428,0l1.11-1.11a1.04,1.04,0,0,1,1.146-.2l.013.005A1.039,1.039,0,0,1,10,19.42v1.571A1.009,1.009,0,0,0,11.009,22h1.982A1.009,1.009,0,0,0,14,20.991V19.42a1.039,1.039,0,0,1,.674-.951l.013-.005a1.04,1.04,0,0,1,1.146.2l1.11,1.11a1.01,1.01,0,0,0,1.428,0l1.4-1.4a1.01,1.01,0,0,0,0-1.428l-1.11-1.11a1.04,1.04,0,0,1-.2-1.146l.005-.013A1.039,1.039,0,0,1,19.42,14h1.571A1.009,1.009,0,0,0,22,12.991V11.009A1.009,1.009,0,0,0,20.991,10ZM12,15a3,3,0,1,1,3-3A3,3,0,0,1,12,15Z" />
    </svg>
  );
};

const DebugModal = ({ contractData }: { contractData: BingoContractData }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const { write: drawNumber, isLoading: drawNumberLoading } = useContractWrite({
    ...contractData,
    mode: "recklesslyUnprepared",
    functionName: "drawNumber",
    onError({ message, stack }) {
      console.error(message);
      console.error(stack);
      toast.error(parseErrorMessage(message, "Failed to draw number"));
    },
  });

  const handleDrawNumber = () => {
    try {
      if (!drawNumber) throw "";
      drawNumber();
    } catch (error) {
      toast.error("Failed to draw number");
    }
  };

  return (
    <>
      <span onClick={() => setModalOpen(true)}>
        <SettingsIcon className="cursor-pointer fill-gray-500 hover:fill-gray-400 h-9" />
      </span>
      <Modal open={modalOpen} setModalOpen={setModalOpen}>
        <Modal.Header>Draw number manually</Modal.Header>
        <Modal.Content>
          <Button onClick={handleDrawNumber} loading={drawNumberLoading}>
            Draw number
          </Button>
        </Modal.Content>
      </Modal>
    </>
  );
};

export default DebugModal;
