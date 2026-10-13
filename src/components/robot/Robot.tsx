import { setting } from "../../controller";
import { useWebSocket } from "../../websocket";

type ThemeType = "blue" | "red";

type RobotProps = {
  theme: ThemeType;
};

const ORIGIN_X = 3900;
const ORIGIN_Y = 500;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const Robot = ({ theme }: RobotProps) => {
  // 末端コンポーネントのみを再レンダリングさせる
  const realtimeStatus = useWebSocket((state) => state.realtimeStatus);

  const FIELD_WIDTH_MM = setting.fieldSize.width;
  const FIELD_HEIGHT_MM = setting.fieldSize.height;

  // 絶対座標の計算
  const baseOriginX = theme === "red" ? FIELD_WIDTH_MM - ORIGIN_X : ORIGIN_X;
  const absoluteX = baseOriginX + realtimeStatus.x;
  const absoluteY = ORIGIN_Y + realtimeStatus.y;

  // オフセット付与後のフィールド座標
  const fieldX = clamp(
    absoluteX + (theme === "red" ? 200 : -200),
    0,
    FIELD_WIDTH_MM,
  );
  const fieldY = clamp(absoluteY + 50, 0, FIELD_HEIGHT_MM);
  const theta = realtimeStatus.theta;

  const displayWidth = setting.fieldSizeScale.width;
  const displayHeight = setting.fieldSizeScale.height;

  const px = (fieldX / FIELD_WIDTH_MM) * displayWidth;
  const py = displayHeight - (fieldY / FIELD_HEIGHT_MM) * displayHeight;

  const robotWidthPx =
    (setting.robotSize.width / FIELD_WIDTH_MM) * displayWidth;

  const robotHeightPx =
    (setting.robotSize.height / FIELD_HEIGHT_MM) * displayHeight;

  const pointSize = Math.min(robotWidthPx, robotHeightPx) * 0.15;

  return (
    <div
      style={{
        position: "absolute",
        left: px,
        top: py,
        width: robotWidthPx,
        height: robotHeightPx,
        // 角度も反転済みなので theta をそのまま使用する
        transform: `translate(-50%, -50%) rotate(${-theta}deg)`,
        transformOrigin: "center center",
        background: "#00ff7f",
        boxSizing: "border-box",
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 10,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "15%",
          width: pointSize,
          height: pointSize,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: "#ff8c00",
        }}
      />
    </div>
  );
};
