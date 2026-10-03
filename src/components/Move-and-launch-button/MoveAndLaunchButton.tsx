import { Button } from "../Button/Button";
import { useEffect, useState, useRef } from "react";
import { useWebSocket } from "../../websocket";
import { useController, useModeStore } from "../../hooks/useController";

export const MoveAndLaunchButton = () => {
  const { sendMessage, realtimeStatus, lastCommand } = useWebSocket();
  const { shootPwm, shootTime } = useController();
  const { mode } = useModeStore();

  //進行状況管理
  const [sequenceState, setSequenceState] = useState<
    "idle" | "moving_to_target"
  >("idle");

  const isOurCommand = useRef(false);

  // 目標地点の物理座標 (mm) と到着判定の閾値
  const TARGET_X = 4447;
  const TARGET_Y = 4866;
  const TARGET_DEGREE = -85.89;
  const ARRIVAL_THRESHOLD = 40;

  // 座標変換用のフィールド定数
  const ORIGIN_X = 3900;
  const ORIGIN_Y = 500;
  const FIELD_WIDTH = 5700;

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
      destDegree = 180 - TARGET_DEGREE;
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

    // 現在の絶対座標を算出
    const currentX =
      ORIGIN_X + (mode === "red" ? -realtimeStatus.x : realtimeStatus.x);
    const currentY = ORIGIN_Y + realtimeStatus.y;

    let destX = TARGET_X;
    if (mode === "red") {
      destX = FIELD_WIDTH - TARGET_X;
    }
    // 目標地点との直線距離を計算
    const dx = currentX - destX;
    const dy = currentY - TARGET_Y;
    const dist = Math.hypot(dx, dy);

    // 射出コマンドの送信
    if (dist < ARRIVAL_THRESHOLD) {
      isOurCommand.current = true;

      sendMessage({
        command: "shoot",
        pwm: shootPwm,
        time: shootTime,
      });

      setSequenceState("idle");

      // 射出後少し待機して初期位置へ移動
      const delayMs = Math.max(shootTime * 1000, 500) + 500;
      setTimeout(() => {
        let resetX = 3900;
        const resetDegree = 0;

        if (mode === "red") {
          resetX = 1800;
        }
        //リセットポジションへ移動;
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
    }
  }, [realtimeStatus, sequenceState, mode, shootPwm, shootTime, sendMessage]);

  return (
    <div>
      <Button
        onClick={handleClick}
        bg={sequenceState === "idle" ? "orange.400" : "red.500"}
      >
        {sequenceState === "idle" ? "移動&発射" : "キャンセル（移動中）"}
      </Button>
    </div>
  );
};
