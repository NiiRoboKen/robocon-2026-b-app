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
    // 発射コマンド
    sendMessage({
      command: "shoot",
      pwm: shootPwm,
      time: shootTime,
    });

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
      >
        <span className="launch-icon">▶</span>
        発射
      </Button>
    </div>
  );
};
