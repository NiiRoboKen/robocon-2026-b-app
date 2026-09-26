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
    sendMessage({
      command: "navigate",
      x: 3900,
      y: 500,
      degree: 0,
      theme: mode,
    });
  };

  return (
    <Button
      onClick={handleResetClick}
      width="100%"
      background="#F8B400"
      rounded="3xl"
    >
      Reset Position
    </Button>
  );
};

export default ResetButton;
