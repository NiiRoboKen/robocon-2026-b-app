import { Button } from "../Button/Button";
import { useWebSocket } from "../../websocket";

export const LoadButton = () => {
  const { sendMessage } = useWebSocket();

  const handleLoad = () => {
    const se = new Audio("/sounds/load.mp3");
    se.volume = 0.8;
    se.currentTime = 0;
    se.play().catch((error) => {
      console.error("SEの再生に失敗しました:", error);
    });
    sendMessage({
      command: "load",
    });
  };

  return (
    <div>
      <Button onClick={handleLoad} bg="orange.400">
        装填
      </Button>
    </div>
  );
};
