import { Button } from "../Button/Button";
import { useEffect, useState, useRef } from "react";
import { useWebSocket } from "../../websocket";
import { useController, useModeStore } from "../../hooks/useController";

// 目標地点の物理座標 (mm) と到着判定の閾値
const TARGET_X = 4279; // 目標地点のX座標 (mm) 青ゾーン左下基準
const TARGET_Y = 5187; // 目標地点のY座標 (mm)
const TARGET_DEGREE = -80.89; // 目標地点の角度 (度) 直角右側が-90度
const ARRIVAL_THRESHOLD = 50; // 到着判定の閾値 (mm)
const ANGLE_THRESHOLD = 2; // 角度の許容範囲 (度)
const LounchDelay = 500; // 位置と角度があってから旗を射出するまでの時間 (ms)
// 座標変換用のフィールド定数
const ORIGIN_X = 3900;
const ORIGIN_Y = 500;
const FIELD_WIDTH = 5700;

export const FlagButton = () => {
  const { sendMessage, realtimeStatus, lastCommand } = useWebSocket();
  const { shootPwm, shootTime } = useController();
  const { mode } = useModeStore();

  // 進行状況管理に「shooting（射出・帰還中）」を追加
  const [sequenceState, setSequenceState] = useState<
    "idle" | "moving_to_target" | "shooting"
  >("idle");

  const abortControllerRef = useRef<AbortController | null>(null);
  const isOurCommand = useRef(false);

  // 非同期ループ内で最新の座標を参照するためのRef
  const realtimeStatusRef = useRef(realtimeStatus);
  useEffect(() => {
    realtimeStatusRef.current = realtimeStatus;
  }, [realtimeStatus]);

  // 他のコマンド介入時の強制キャンセル監視
  useEffect(() => {
    if (sequenceState === "idle") return;
    if (!lastCommand) return;
    if (isOurCommand.current) return;

    abortControllerRef.current?.abort();
  }, [lastCommand, sequenceState]);

  // 非同期用の安全な待機関数
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

  // 自身が発行したコマンドで監視が誤発火しないようフラグを制御するラッパー
  const sendCommandSafe = (cmd: Parameters<typeof sendMessage>[0]) => {
    isOurCommand.current = true;
    sendMessage(cmd);
    setTimeout(() => {
      isOurCommand.current = false;
    }, 200);
  };

  // 目標到達までポーリング待機する関数
  const waitForArrival = async (
    targetX: number,
    targetY: number,
    targetDegree: number,
    signal: AbortSignal,
    timeoutMs: number = 15000,
  ) => {
    return new Promise<void>((resolve, reject) => {
      const startTime = Date.now();

      const checkInterval = setInterval(() => {
        if (signal.aborted) {
          clearInterval(checkInterval);
          reject(new DOMException("Aborted", "AbortError"));
          return;
        }

        if (Date.now() - startTime > timeoutMs) {
          clearInterval(checkInterval);
          reject(new Error("Timeout waiting for arrival"));
          return;
        }

        const status = realtimeStatusRef.current;
        const baseOriginX = mode === "red" ? FIELD_WIDTH - ORIGIN_X : ORIGIN_X;
        const currentX = baseOriginX + status.x;
        const currentY = ORIGIN_Y + status.y;
        const currentTheta = status.theta;

        const dist = Math.hypot(currentX - targetX, currentY - targetY);
        let diffDegree = currentTheta - targetDegree;
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
      await sleep(LounchDelay, signal);
      setSequenceState("shooting");
      sendCommandSafe({
        command: "shoot",
        pwm: shootPwm,
        time: shootTime,
      });

      const delayMs = Math.max(shootTime * 1000, 500) + 500;
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
      // AbortError等で中断された場合はステートを戻して終了
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
        bg={sequenceState === "idle" ? "cyan.400" : "red.500"}
      >
        {sequenceState === "idle" ? "移動&旗" : "キャンセル"}
      </Button>
    </div>
  );
};
