import { useWebSocket } from "../../websocket";
import { useModeStore } from "../../hooks/useController";
import { setting } from "../../controller";

type RobotCoordinateProps = {
  connected?: boolean;
};

const ORIGIN_X = 3900;
const ORIGIN_Y = 500;

export const RobotCoordinate = ({ connected = true }: RobotCoordinateProps) => {
  // realtimeStatusだけを監視し、100ms周期でここだけが再レンダリングされるようにする
  const realtimeStatus = useWebSocket((state) => state.realtimeStatus);
  const mode = useModeStore((state) => state.mode);

  // 絶対座標の計算
  const baseOriginX =
    mode === "red" ? setting.fieldSize.width - ORIGIN_X : ORIGIN_X;
  const x = baseOriginX + realtimeStatus.x;
  const y = ORIGIN_Y + realtimeStatus.y;
  const theta = realtimeStatus.theta;

  return (
    <div
      style={{
        marginTop: 8,
        padding: "10px 12px",
        border: "1px solid #ddd",
        borderRadius: 8,
        fontFamily: "monospace",
        background: "#fafafa",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap",
          color: "#000000",
        }}
      >
        <span>x: {Math.round(x)}</span>
        <span>y: {Math.round(y)}</span>
        <span>θ: {theta.toFixed(2)}</span>
        <span
          style={{
            marginLeft: "auto",
            color: connected ? "#16a34a" : "#dc2626",
            fontWeight: 700,
          }}
        >
          {connected ? "CONNECTED" : "DISCONNECTED"}
        </span>
      </div>
    </div>
  );
};
