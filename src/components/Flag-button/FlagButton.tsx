import { Button } from "../Button/Button";
import { useEffect, useState, useRef } from "react";
import { useWebSocket } from "../../websocket";
import { useController, useModeStore } from "../../hooks/useController";

// 目標地点の物理座標 (mm) と到着判定の閾値
const TARGET_X = 4447;
const TARGET_Y = 4866;
const TARGET_DEGREE = -75.89;
const ARRIVAL_THRESHOLD = 50;
const ANGLE_THRESHOLD = 2; // 角度の許容範囲 (度)

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

    // 赤陣地モードの場合はX座標と角度を反転
    if (mode === "red") {
      destX = FIELD_WIDTH - TARGET_X;
      destDegree = 180 - TARGET_DEGREE; //ToDoフィールドで見てなおす
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
    if (sequenceState === "idle") return;
    if (!lastCommand) return;
    if (isOurCommand.current) return;

    // 他操作時、タイマーを破棄して中断
    setSequenceState("idle");
    clearAllTimeouts();
  }, [lastCommand, sequenceState]);

  // 自己位置の監視と到達判定・射出シーケンス
  useEffect(() => {
    if (sequenceState !== "moving_to_target") return;

    // 現在の絶対座標を算出
    const currentX =
      ORIGIN_X + (mode === "red" ? -realtimeStatus.x : realtimeStatus.x);
    const currentY = ORIGIN_Y + realtimeStatus.y;
    const currentTheta =
      mode === "red" ? -realtimeStatus.theta : realtimeStatus.theta;

    let destX = TARGET_X;
    let destDegree = TARGET_DEGREE;

    if (mode === "red") {
      destX = FIELD_WIDTH - TARGET_X;
      destDegree = 180 - TARGET_DEGREE;
    }
    // 目標地点との直線距離を計算
    const dx = currentX - destX;
    const dy = currentY - TARGET_Y;
    const dist = Math.hypot(dx, dy);

    // 目標角度との差を計算 (-180〜180度の範囲に正規化)
    let diffDegree = currentTheta - destDegree;
    diffDegree = ((diffDegree + 540) % 360) - 180;
    const isAngleMatched = Math.abs(diffDegree) < ANGLE_THRESHOLD;

    // 射出コマンドの送信
    if (dist < ARRIVAL_THRESHOLD && isAngleMatched) {
      isOurCommand.current = true;

      sendMessage({
        command: "shoot",
        pwm: shootPwm,
        time: shootTime,
      });

      // 状態を「shooting」に変更（アイドルには戻さない）
      setSequenceState("shooting");

      // 射出後少し待機して初期位置へ移動
      const delayMs = Math.max(shootTime * 1000, 500) + 500;
      const t1 = setTimeout(() => {
        let resetX = 3850;
        const resetDegree = 0;

        // 赤陣地用のリセット位置を設定
        if (mode === "red") {
          resetX = 1850;
        }

        isOurCommand.current = true;
        // リセットポジションへ移動
        sendMessage({
          command: "navigate",
          x: resetX,
          y: 500,
          degree: resetDegree,
          theme: mode,
        });

        // 移動コマンドを発行して初めてシーケンス完了
        setSequenceState("idle");

        setTimeout(() => {
          isOurCommand.current = false;
        }, 200);
      }, delayMs);

      timeoutsRef.current.push(t1);
    }
  }, [realtimeStatus, sequenceState, mode, shootPwm, shootTime, sendMessage]);

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
