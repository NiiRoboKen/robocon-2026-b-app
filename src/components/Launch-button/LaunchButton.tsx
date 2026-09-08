import { Button } from "../Button/Button";
import { useWebSocket } from "../../websocket";
import { useController } from "../../hooks/useController";
export const LaunchButton = () => {
  const {sendMessage} = useWebSocket();
  const {shootPwm,shootTime} = useController();

  const handleLaunch = () => {
    sendMessage({
      command: "set_shoot",
      pwm: shootPwm,
      time: shootTime,
    });
  };

  return (
    <div>
      <Button onClick={handleLaunch}>発射</Button>
    </div>
  );
};
