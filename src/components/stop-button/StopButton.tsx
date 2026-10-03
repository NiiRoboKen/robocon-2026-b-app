import { useWebSocket } from "../../websocket.ts";
import "./StopButton.css";
import { Button } from "../Button/Button";

const { sendMessage } = useWebSocket.getState();

const AllStopButton = () => {
  return (
    <Button
      className="StopButton"
      onClick={() => sendMessage({ command: "emergency_stop" })}
    >
      緊急停止
    </Button>
  );
};
export default AllStopButton;

// export const ArmStopButton = () => {
// 	return (<button onClick={()=> sendMessage({command: "arm_stop"})}>Arm Stop</button>);
// };
