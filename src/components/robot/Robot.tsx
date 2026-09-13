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

export const Robot = ({ x, y, theta = 0, theme }: RobotProps) => {
  const FIELD_WIDTH_MM = setting.fieldSize.width;
  const FIELD_HEIGHT_MM = setting.fieldSize.height;

  const displayWidth = setting.fieldSizeScale.width;
  const displayHeight = setting.fieldSizeScale.height;

  let fieldX = clamp(x, 0, FIELD_WIDTH_MM);
  const fieldY = clamp(y, 0, FIELD_HEIGHT_MM);
  let displayTheta = theta;

  if (theme === "red") {
    fieldX = FIELD_WIDTH_MM - fieldX;
    displayTheta = 180 - theta;
  }

  const px = (fieldX / FIELD_WIDTH_MM) * displayWidth;
  const py = displayHeight - (fieldY / FIELD_HEIGHT_MM) * displayHeight;

  const robotWidthPx =
    (setting.robotSize.width / FIELD_WIDTH_MM) * displayWidth;
  const robotHeightPx =
    (setting.robotSize.height / FIELD_HEIGHT_MM) * displayHeight;

  return (
    <div
      style={{
        position: "absolute",
        left: px,
        top: py,
        width: robotWidthPx,
        height: robotHeightPx,
        transform: `translate(-50%, -50%) rotate(${-displayTheta}deg)`,
        transformOrigin: "center center",
        background: "#00ff7f",
        border: "2px solid white",
        boxSizing: "border-box",
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 10,
      }}
    />
  );
};
