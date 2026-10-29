import { Button } from "@chakra-ui/react";
import { useWebSocket } from "../../websocket";
import { useModeStore } from "../../hooks/useController";
import "./ResetButton.css";

type ResetButtonProps = {
  onReset: () => void;
};

const ResetButton = ({ onReset }: ResetButtonProps) => {
  const { sendMessage } = useWebSocket();
  const { mode } = useModeStore();

  const handleResetClick = () => {
    onReset();
    const resetX = mode === "red" ? 1850 : 3850;
    sendMessage({
      command: "navigate",
      x: resetX,
      y: 500,
      degree: 0,
      theme: mode,
    });
  };

  return (
    <div className="reset-wrapper">
      <Button onClick={handleResetClick} className="pachinko-reset-button">
        <span className="reset-icon">🌀</span>
        座標リセット
        <span className="reset-icon">🌀</span>
      </Button>
    </div>
  );
};

export default ResetButton;
