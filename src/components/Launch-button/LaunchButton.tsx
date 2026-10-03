import { Button } from "@chakra-ui/react";
import { useWebSocket } from "../../websocket";
import { useController } from "../../hooks/useController";
export const LaunchButton = () => {
  const { sendMessage } = useWebSocket();
  const { shootPwm, shootTime } = useController();

  const handleLaunch = () => {
    sendMessage({
      command: "shoot",
      pwm: shootPwm,
      time: shootTime,
    });
  };

  return (
    <div>
      <Button onClick={handleLaunch} bg="green.400" rounded="3xl">
        発射
      </Button>
    </div>
  );
};
