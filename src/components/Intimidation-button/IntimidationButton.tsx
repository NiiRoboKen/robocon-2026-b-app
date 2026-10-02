import { Button } from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import { useWebSocket } from "../../websocket";
import { useModeStore } from "../../hooks/useController";

const IntimidationButton = () => {
  const { sendMessage, realtimeStatus, lastCommand } = useWebSocket();
  const { mode } = useModeStore();

  const [sequenceState, setSequenceState] = useState<"idle" | "aiming">("idle");
  const isOurCommand = useRef(false);

  const TARGET_X = 3900;
  const TARGET_Y = 0;

  const OUTPUT_PWM = 1783;
  const OUTPUT_TIME = 0.28;

  const ORIGIN_X = 3900;
  const ORIGIN_Y = 500;
  const FIELD_WIDTH = 5700;
  const TURN_WAIT_MS = 1500;

  const handleClick = () => {
    if (sequenceState === "aiming") {
      sendMessage({ command: "emergency_stop" });
      setSequenceState("idle");
      return;
    }

    const currentX =
      ORIGIN_X + (mode === "red" ? -realtimeStatus.x : realtimeStatus.x);
    const currentY = ORIGIN_Y + realtimeStatus.y;

    let destX = TARGET_X;
    if (mode === "red") {
      destX = FIELD_WIDTH - TARGET_X;
    }

    const dx = destX - currentX;
    const dy = TARGET_Y - currentY;
    let targetDegree = Math.atan2(-dx, dy) * (180 / Math.PI);

    if (mode === "red") {
      targetDegree = -targetDegree;
    }

    isOurCommand.current = true;
    setSequenceState("aiming");

    sendMessage({
      command: "navigate",
      x: currentX,
      y: currentY,
      degree: targetDegree,
      theme: mode,
    });

    setTimeout(() => {
      isOurCommand.current = false;
    }, 200);
  };

  useEffect(() => {
    if (sequenceState !== "aiming") return;
    if (!lastCommand) return;
    if (isOurCommand.current) return;
    setSequenceState("idle");
  }, [lastCommand, sequenceState]);

  useEffect(() => {
    if (sequenceState !== "aiming") return;

    const timeoutId = setTimeout(() => {
      isOurCommand.current = true;

      sendMessage({
        command: "shoot",
        pwm: OUTPUT_PWM,
        time: OUTPUT_TIME,
      });

      setSequenceState("idle");

      setTimeout(() => {
        isOurCommand.current = false;
      }, 200);
    }, TURN_WAIT_MS);

    return () => clearTimeout(timeoutId);
  }, [sequenceState, sendMessage]);

  return (
    <Button
      onClick={handleClick}
      rounded="3xl"
      bg={sequenceState === "idle" ? "purple.900" : "red.900"}
      color="white"
      _active={{
        transform: "translateY(3px)",
      }}
    >
      {sequenceState === "idle" ? "おどし♬" : "キャンセル（旋回中）"}
    </Button>
  );
};

export default IntimidationButton;
