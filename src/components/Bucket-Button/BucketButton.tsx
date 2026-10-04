import { Button } from "../Button/Button";
import { useEffect, useState, useRef } from "react";
import { useWebSocket } from "../../websocket";
import { useModeStore } from "../../hooks/useController";

// 目標地点の物理座標 (mm) と到着判定の閾値
const TARGET_X = 3226;
const TARGET_Y = 4046;
const TARGET_DEGREE = -88.35;
const ARRIVAL_THRESHOLD = 50;
const ANGLE_THRESHOLD = 2; // 角度の許容範囲 (度)
const LounchDelay = 5000; // 2回目と3回目の間隔（5秒）
//発射スピードと時間
const OUTPUT_PWM = 1500;
const OUTPUT_TIME = 0.3;

// 座標変換用のフィールド定数
const ORIGIN_X = 3900;
const ORIGIN_Y = 500;
const FIELD_WIDTH = 5700;

export const BucketButton = () => {
  const { sendMessage, realtimeStatus, lastCommand } = useWebSocket();
  const { mode } = useModeStore();

  // 進行状況管理に「shooting（射出シーケンス中）」を追加
  const [sequenceState, setSequenceState] = useState<
    "idle" | "moving_to_target" | "shooting"
  >("idle");

  const isOurCommand = useRef(false);
  // 発行したsetTimeoutのIDを保持する配列
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // 保持しているすべてのタイマーを破棄する関数
  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  // ボタンクリック時
  const handleClick = () => {
    // 移動中・射出中の場合、緊急停止コマンドを発行してシーケンスを完全破棄
    if (sequenceState !== "idle") {
      sendMessage({ command: "emergency_stop" });
      setSequenceState("idle");
      clearAllTimeouts();
      return;
    }

    let destX = TARGET_X;
    let destDegree = TARGET_DEGREE;

    if (mode === "red") {
      destX = FIELD_WIDTH - TARGET_X;
      destDegree = -TARGET_DEGREE;
    }

    isOurCommand.current = true;
    setSequenceState("moving_to_target");

    sendMessage({
      command: "navigate",
      x: destX,
      y: TARGET_Y,
      degree: destDegree,
      theme: mode,
    });

    setTimeout(() => {
      isOurCommand.current = false;
    }, 200);
  };

  // コマンド介入監視（他のボタンが押されたときの処理）
  useEffect(() => {
    if (sequenceState === "idle") return;
    if (!lastCommand) return;
    if (isOurCommand.current) return;

    // 他の操作が行われたため、シーケンスとタイマーをすべて破棄して中断
    setSequenceState("idle");
    clearAllTimeouts();
  }, [lastCommand, sequenceState]);

  // 自己位置の監視と到達判定・射出シーケンス
  useEffect(() => {
    if (sequenceState !== "moving_to_target") return;

    const baseOriginX = mode === "red" ? FIELD_WIDTH - ORIGIN_X : ORIGIN_X;
    const currentX = baseOriginX + realtimeStatus.x;
    const currentY = ORIGIN_Y + realtimeStatus.y;
    const currentTheta = realtimeStatus.theta;

    let destX = TARGET_X;
    let destDegree = TARGET_DEGREE;

    if (mode === "red") {
      destX = FIELD_WIDTH - TARGET_X;
      destDegree = -TARGET_DEGREE;
    }

    const dx = currentX - destX;
    const dy = currentY - TARGET_Y;
    const dist = Math.hypot(dx, dy);

    let diffDegree = currentTheta - destDegree;
    diffDegree = ((diffDegree + 540) % 360) - 180;
    const isAngleMatched = Math.abs(diffDegree) < ANGLE_THRESHOLD;

    // 到達判定
    if (dist < ARRIVAL_THRESHOLD && isAngleMatched) {
      isOurCommand.current = true;

      // 1回目の射出
      sendMessage({
        command: "shoot",
        pwm: OUTPUT_PWM,
        time: OUTPUT_TIME,
      });

      // 状態を「shooting」に変更（アイドルには戻さない）
      setSequenceState("shooting");

      // 2回目の射出（LounchDelay後）
      const t1 = setTimeout(() => {
        isOurCommand.current = true;
        sendMessage({
          command: "shoot",
          pwm: OUTPUT_PWM,
          time: OUTPUT_TIME,
        });

        // 3回目の射出
        const t2 = setTimeout(() => {
          isOurCommand.current = true;
          sendMessage({
            command: "shoot",
            pwm: OUTPUT_PWM,
            time: OUTPUT_TIME,
          });

          // 3回目の射出後、初期位置へ移動
          const delayMs = Math.max(OUTPUT_TIME * 1000, 500) + 500;
          const t3 = setTimeout(() => {
            let resetX = 3850;
            if (mode === "red") {
              resetX = 1850;
            }

            isOurCommand.current = true;
            sendMessage({
              command: "navigate",
              x: resetX,
              y: 500,
              degree: 0,
              theme: mode,
            });

            // リセットポジションへの移動コマンドを発行して、初めてシーケンス完了
            setSequenceState("idle");

            setTimeout(() => {
              isOurCommand.current = false;
            }, 200);
          }, delayMs);
          timeoutsRef.current.push(t3);
        }, LounchDelay);
        timeoutsRef.current.push(t2);
      }, LounchDelay);
      timeoutsRef.current.push(t1);
    }
  }, [realtimeStatus, sequenceState, mode, sendMessage]);

  return (
    <div>
      <Button
        onClick={handleClick}
        bg={sequenceState === "idle" ? "purple.400" : "red.500"}
      >
        {sequenceState === "idle" ? "移動&バケツ" : "キャンセル（実行中）"}
      </Button>
    </div>
  );
};
