import { Button } from "../Button/Button";
import { useEffect, useState, useRef } from "react";
import { useWebSocket } from "../../websocket";
import { useModeStore } from "../../hooks/useController";

const TARGET_X = 3226;
const TARGET_Y = 4046;
const TARGET_DEGREE = -88.35;
const ARRIVAL_THRESHOLD = 50;
const ANGLE_THRESHOLD = 2;
const LounchDelay = 5000;
const OUTPUT_PWM = 1500;
const OUTPUT_TIME = 0.3;

const ORIGIN_X = 3900;
const ORIGIN_Y = 500;
const FIELD_WIDTH = 5700;

export const BucketButton = () => {
  const { sendMessage, realtimeStatus, lastCommand } = useWebSocket();
  const { mode } = useModeStore();

  const [sequenceState, setSequenceState] = useState<
    "idle" | "moving_to_target" | "shooting"
  >("idle");

  const abortControllerRef = useRef<AbortController | null>(null);
  const isOurCommand = useRef(false);
  const realtimeStatusRef = useRef(realtimeStatus);

  useEffect(() => {
    realtimeStatusRef.current = realtimeStatus;
  }, [realtimeStatus]);

  useEffect(() => {
    if (sequenceState === "idle") return;
    if (!lastCommand) return;
    if (isOurCommand.current) return;

    abortControllerRef.current?.abort();
  }, [lastCommand, sequenceState]);

  const sleep = (ms: number, signal: AbortSignal) => {
    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, ms);
      signal.addEventListener(
        "abort",
        () => {
          clearTimeout(timer);
          reject(new DOMException("Aborted", "AbortError"));
        },
        { once: true },
      );
    });
  };

  const sendCommandSafe = (cmd: Parameters<typeof sendMessage>[0]) => {
    isOurCommand.current = true;
    sendMessage(cmd);
    setTimeout(() => {
      isOurCommand.current = false;
    }, 200);
  };

  const waitForArrival = async (
    targetX: number,
    targetY: number,
    targetDegree: number,
    signal: AbortSignal,
  ) => {
    return new Promise<void>((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (signal.aborted) {
          clearInterval(checkInterval);
          reject(new DOMException("Aborted", "AbortError"));
          return;
        }

        const status = realtimeStatusRef.current;
        const baseOriginX = mode === "red" ? FIELD_WIDTH - ORIGIN_X : ORIGIN_X;
        const currentX = baseOriginX + status.x;
        const currentY = ORIGIN_Y + status.y;

        const dist = Math.hypot(currentX - targetX, currentY - targetY);
        let diffDegree = status.theta - targetDegree;
        diffDegree = ((diffDegree + 540) % 360) - 180;

        if (
          dist < ARRIVAL_THRESHOLD &&
          Math.abs(diffDegree) < ANGLE_THRESHOLD
        ) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      signal.addEventListener(
        "abort",
        () => {
          clearInterval(checkInterval);
          reject(new DOMException("Aborted", "AbortError"));
        },
        { once: true },
      );
    });
  };

  const executeSequence = async () => {
    abortControllerRef.current?.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const signal = abortController.signal;

    try {
      let destX = TARGET_X;
      let destDegree = TARGET_DEGREE;

      if (mode === "red") {
        destX = FIELD_WIDTH - TARGET_X;
        destDegree = -TARGET_DEGREE;
      }

      setSequenceState("moving_to_target");
      sendCommandSafe({
        command: "navigate",
        x: destX,
        y: TARGET_Y,
        degree: destDegree,
        theme: mode,
      });

      await waitForArrival(destX, TARGET_Y, destDegree, signal);

      setSequenceState("shooting");

      sendCommandSafe({ command: "shoot", pwm: OUTPUT_PWM, time: OUTPUT_TIME });
      await sleep(LounchDelay, signal);

      sendCommandSafe({ command: "shoot", pwm: OUTPUT_PWM, time: OUTPUT_TIME });
      await sleep(LounchDelay, signal);

      sendCommandSafe({ command: "shoot", pwm: OUTPUT_PWM, time: OUTPUT_TIME });
      const delayMs = Math.max(OUTPUT_TIME * 1000, 500) + 500;
      await sleep(delayMs, signal);

      const resetX = mode === "red" ? 1850 : 3850;
      sendCommandSafe({
        command: "navigate",
        x: resetX,
        y: 500,
        degree: 0,
        theme: mode,
      });

      setSequenceState("idle");
    } catch {
      setSequenceState("idle");
    }
  };

  const handleClick = () => {
    if (sequenceState !== "idle") {
      sendMessage({ command: "emergency_stop" });
      abortControllerRef.current?.abort();
      setSequenceState("idle");
      return;
    }
    executeSequence();
  };

  return (
    <div>
      <Button
        onClick={handleClick}
        bg={sequenceState === "idle" ? "purple.400" : "red.500"}
      >
        {sequenceState === "idle" ? "移動&バケツ" : "キャンセル"}
      </Button>
    </div>
  );
};
