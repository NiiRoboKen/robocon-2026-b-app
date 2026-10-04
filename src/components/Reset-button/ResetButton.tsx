import { Button } from "@chakra-ui/react";
import { useWebSocket } from "../../websocket";
import { useModeStore } from "../../hooks/useController";

type ResetButtonProps = {
  onReset: () => void;
};

const ResetButton = ({ onReset }: ResetButtonProps) => {
  const { sendMessage } = useWebSocket();

  const { mode } = useModeStore();

  // 初期位置に移動
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
    <Button
      onClick={handleResetClick}
      bg="#F8B400"
      _active={{
        transform: "translateY(3px)",
      }}
      rounded="3xl"
    >
      リセットポジション
    </Button>
  );
};

export default ResetButton;
