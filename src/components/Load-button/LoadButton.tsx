import { Button } from "../Button/Button";
import { useWebSocket } from "../../websocket";

export const LoadButton = () => {
  const { sendMessage } = useWebSocket();

  const handleLoad = () => {
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
