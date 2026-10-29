import { useState } from "react";
import { useWebSocket } from "../../websocket.ts";
import "./StopButton.css";

const AllStopButton = () => {
  const { sendMessage } = useWebSocket.getState();

  const [coverOpen, setCoverOpen] = useState(false);
  const [emergencyActive, setEmergencyActive] = useState(false);

  const handleEmergencyStop = () => {
    if (!coverOpen) return;

    // 非常停止命令を送信
    sendMessage({ command: "emergency_stop" });

    // ボタンを発光
    setEmergencyActive(true);

    // 0.5秒後に発光だけ終了
    setTimeout(() => {
      setEmergencyActive(false);
    }, 500);
  };

  const handleCover = () => {
    setCoverOpen((open) => !open);
  };

  return (
    <div className="emergency-panel">
      <div className="emergency-button">
        <div className="emergency-stripes">
          {/* 赤い非常停止ボタン */}
          <button
            className={`emergency-button__red ${
              emergencyActive ? "emergency-active" : ""
            }`}
            onClick={handleEmergencyStop}
            disabled={!coverOpen}
          >
            緊急停止
          </button>

          {/* カバー */}
          <button
            className={`emergency-cover ${
              coverOpen ? "emergency-cover--open" : ""
            }`}
            onClick={handleCover}
            aria-label={
              coverOpen
                ? "非常停止ボタンのカバーを閉じる"
                : "非常停止ボタンのカバーを開く"
            }
          >
            <span className="cover-handle" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllStopButton;
