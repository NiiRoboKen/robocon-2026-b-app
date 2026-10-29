import { useState } from "react";
import { Button } from "../Button/Button";
import { useWebSocket } from "../../websocket";
import { useController } from "../../hooks/useController";
import "./LaunchButton.css";

export const LaunchButton = () => {
  const { sendMessage } = useWebSocket();
  const { shootPwm, shootTime } = useController();

  const [effect, setEffect] = useState(false);

  const handleLaunch = () => {
    // 1. 発射の瞬間の音
    const se1 = new Audio("/sounds/launch.mp3");
    se1.volume = 0.8;
    se1.currentTime = 0;
    se1.play().catch((error) => {
      console.error("SEの再生に失敗しました:", error);
    });

    // 発射コマンドを送信
    sendMessage({
      command: "shoot",
      pwm: shootPwm,
      time: shootTime,
    });

    const delayMs = 1500;

    setTimeout(() => {
      const se2 = new Audio("/sounds/afterlaunch.mp3");
      se2.volume = 1;
      se2.currentTime = 0; // 1秒地点から再生
      se2.play().catch((error) => {
        console.error("SEの再生に失敗しました:", error);
      });
    }, delayMs);

    // エフェクト開始
    setEffect(false);

    // 同じエフェクトを連続で出せるようにする
    requestAnimationFrame(() => {
      setEffect(true);
    });
  };

  const handleEffectEnd = () => {
    setEffect(false);
  };

  return (
    <div className="launch-wrapper">
      {/* 発射エフェクト */}
      {effect && (
        <>
          <div className="launch-flash" />
          <div className="launch-beams" />
          <div className="launch-effect" />
          <div className="launch-shock" onAnimationEnd={handleEffectEnd} />

          <span className="spark spark-1">✦</span>
          <span className="spark spark-2">✦</span>
          <span className="spark spark-3">✦</span>
          <span className="spark spark-4">✦</span>
          <span className="spark spark-5">✦</span>
          <span className="spark spark-6">✦</span>
          <span className="spark spark-7">✦</span>
          <span className="spark spark-8">✦</span>
        </>
      )}

      <Button
        className={`launch-button ${effect ? "launch-button--fire" : ""}`}
        onClick={handleLaunch}
        bg="green.400"
      >
        <span className="launch-icon">▶</span>
        発射
      </Button>
    </div>
  );
};
