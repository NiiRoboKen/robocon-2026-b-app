import { setting } from "../../controller";

type ThemeType = "blue" | "red";

type RobotProps = {
  x: number;
  y: number;
  theta?: number;
  theme: ThemeType;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const Robot = ({ x, y, theta = 0 }: RobotProps) => {
  const FIELD_WIDTH_MM = setting.fieldSize.width;
  const FIELD_HEIGHT_MM = setting.fieldSize.height;

  const displayWidth = setting.fieldSizeScale.width;
  const displayHeight = setting.fieldSizeScale.height;

  // 親コンポーネントで反転済みの絶対座標が渡されるため、そのまま使用する
  const fieldX = clamp(x, 0, FIELD_WIDTH_MM);
  const fieldY = clamp(y, 0, FIELD_HEIGHT_MM);

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
