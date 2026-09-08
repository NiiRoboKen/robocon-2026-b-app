import { useState } from "react";
import { useWebSocket } from "../../websocket.ts";
import "./StopButton.css";

const AllStopButton = () => {
  const { sendMessage } = useWebSocket.getState();

  const [coverOpen, setCoverOpen] = useState(false);

  return (
    <div className="emergency-panel">
      <div className="emergency-button">
        <div className="emergency-stripes">

          {/* 赤い非常停止ボタン */}
          <button
            className="emergency-button__red"
            onClick={() => {
              if (coverOpen) {
                sendMessage({ command: "emergency_stop" });
              }
            }}
            disabled={!coverOpen}
          >
            緊急停止
          </button>

          {/* カバー */}
          <button
            className={`emergency-cover ${
              coverOpen ? "emergency-cover--open" : ""
            }`}
            onClick={() => setCoverOpen(true)}
            aria-label="非常停止ボタンのカバーを開く"
          >
            <span className="cover-handle" />
          </button>

        </div>
      </div>

      <div className="emergency-label">
        ⚠ 緊急停止
      </div>
    </div>
  );
};

export default AllStopButton;