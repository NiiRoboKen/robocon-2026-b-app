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
const LounchDelay = 4000; // 2回目と3回目の間隔（4秒）
//発射スピードと時間
const OUTPUT_PWM = 1810;
const OUTPUT_TIME = 0.3;

// 座標変換用のフィールド定数
const ORIGIN_X = 3900;
const ORIGIN_Y = 500;
const FIELD_WIDTH = 5700;

export const BucketButton = () => {
  const { sendMessage, realtimeStatus, lastCommand } = useWebSocket();
  const { mode } = useModeStore();

  //進行状況管理
  const [sequenceState, setSequenceState] = useState<
    "idle" | "moving_to_target"
  >("idle");

  const isOurCommand = useRef(false);

  // ボタンクリック時
  const handleClick = () => {
    // 移動中の場合緊急停止コマンドを発行
    if (sequenceState === "moving_to_target") {
      sendMessage({ command: "emergency_stop" });
      setSequenceState("idle");
      return;
    }

    let destX = TARGET_X;
    let destDegree = TARGET_DEGREE;

    // 赤陣地モードの場合はX座標と角度を反転
    if (mode === "red") {
      destX = FIELD_WIDTH - TARGET_X;
      destDegree = -TARGET_DEGREE;
    }

    isOurCommand.current = true;
    setSequenceState("moving_to_target");

    // 目標座標への移動コマンドを送信
    sendMessage({
      command: "navigate",
      x: destX,
      y: TARGET_Y,
      degree: destDegree,
      theme: mode,
    });

    //コマンド発行フラグをリセット;
    setTimeout(() => {
      isOurCommand.current = false;
    }, 200);
  };

  // コマンド介入監視
  useEffect(() => {
    if (sequenceState !== "moving_to_target") return;
    if (!lastCommand) return;
    if (isOurCommand.current) return;
    // 他操作時中断
    setSequenceState("idle");
  }, [lastCommand, sequenceState]);

  // 自己位置の監視と到達判定・射出シーケンス
  useEffect(() => {
    if (sequenceState !== "moving_to_target") return;

    // ★ 赤陣地の基準X座標（1800）を正しく計算する
    const baseOriginX = mode === "red" ? FIELD_WIDTH - ORIGIN_X : ORIGIN_X;

    // ★ 反転処理を削除し、純粋に基準位置からの移動量を足す
    const currentX = baseOriginX + realtimeStatus.x;
    const currentY = ORIGIN_Y + realtimeStatus.y;

    // ★ 角度も既にロボット側で実態に合っているため、反転させずにそのまま使用する
    const currentTheta = realtimeStatus.theta;

    let destX = TARGET_X;
    let destDegree = TARGET_DEGREE; // 判定用の目標角度を追加

    if (mode === "red") {
      destX = FIELD_WIDTH - TARGET_X;
      destDegree = -TARGET_DEGREE; // 判定用の目標角度も反転させる
    }

    // 目標地点との直線距離を計算
    const dx = currentX - destX;
    const dy = currentY - TARGET_Y;
    const dist = Math.hypot(dx, dy);

    // 目標角度との差を計算 (-180〜180度の範囲に正規化)
    // 固定のTARGET_DEGREEではなく、赤青を考慮したdestDegreeと比較する
    let diffDegree = currentTheta - destDegree;
    diffDegree = ((diffDegree + 540) % 360) - 180;
    const isAngleMatched = Math.abs(diffDegree) < ANGLE_THRESHOLD;

    // 射出コマンドの送信
    if (dist < ARRIVAL_THRESHOLD && isAngleMatched) {
      isOurCommand.current = true;

      // 1回目の射出（到着直後）
      sendMessage({
        command: "shoot",
        pwm: OUTPUT_PWM,
        time: OUTPUT_TIME,
      });

      setSequenceState("idle");

      // 2回目の射出（LounchDelay後）
      setTimeout(() => {
        isOurCommand.current = true;

        sendMessage({
          command: "shoot",
          pwm: OUTPUT_PWM,
          time: OUTPUT_TIME,
        });

        // 3回目の射出（2回目からさらにLounchDelay後）
        setTimeout(() => {
          isOurCommand.current = true;

          sendMessage({
            command: "shoot",
            pwm: OUTPUT_PWM,
            time: OUTPUT_TIME,
          });

          // 3回目の射出後少し待機して初期位置へ移動
          const delayMs = Math.max(OUTPUT_TIME * 1000, 500) + 500;
          setTimeout(() => {
            let resetX = 3900;
            const resetDegree = 0;

            // 赤陣地用のリセット位置を設定
            if (mode === "red") {
              resetX = 1800;
            }

            // リセットポジションへ移動;
            sendMessage({
              command: "navigate",
              x: resetX,
              y: 500,
              degree: resetDegree,
              theme: mode,
            });

            setTimeout(() => {
              isOurCommand.current = false;
            }, 200);
          }, delayMs);
        }, LounchDelay);
      }, LounchDelay);
    }
  }, [realtimeStatus, sequenceState, mode, sendMessage]);

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
