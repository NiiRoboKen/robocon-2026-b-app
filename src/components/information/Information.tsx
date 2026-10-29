import { useController } from "../../hooks/useController";
import { useWebSocket } from "../../websocket";
import "./Information.css";

const Information = () => {
  const { targetPositionScale, theta } = useController();
  const { status, realtimeStatus } = useWebSocket();

  return (
    <div className="pachinko-info-container">
      <h1 className="pachinko-title blink-text">🎰 {status} 🎰</h1>
      <div className="info">
        <div className="box pachinko-box">
          <h2 className="pachinko-subtitle">🎯 Target Position</h2>
          <p className="pachinko-data">
            X: <span>{targetPositionScale.x}</span>
          </p>
          <p className="pachinko-data">
            Y: <span>{targetPositionScale.y}</span>
          </p>
          <p className="pachinko-data">
            θ: <span>{theta}</span>
          </p>
        </div>
        <div className="box pachinko-box">
          <h2 className="pachinko-subtitle">🚀 Real Time Position</h2>
          <p className="pachinko-data">
            X: <span>{Math.round(realtimeStatus.x)}</span>
          </p>
          <p className="pachinko-data">
            Y: <span>{Math.round(realtimeStatus.y)}</span>
          </p>
          <p className="pachinko-data">
            θ: <span>{Math.round(realtimeStatus.theta)}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Information;
