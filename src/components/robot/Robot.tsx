type RobotProps = {
  x: number;
  y: number;

  fieldWidthPx: number;
  fieldHeightPx: number;

  theta?: number;

  size?: number; //px
  color?: string;
};

const FIELD_W = 6000;
const FIELD_H = 10500;

export const Robot = ({
  x,
  y,
  fieldWidthPx,
  fieldHeightPx,
  theta = 0,
  size = 18,
  color = "#00ff7f",
}: RobotProps) => {
  const clampedX = Math.max(0, Math.min(FIELD_W, x));
  const clampedY = Math.max(0, Math.min(FIELD_H, y));

  const left = (clampedX / FIELD_W) * fieldWidthPx;
  const top = (clampedY / FIELD_H) * fieldHeightPx;

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        border: "2px solid #fff",
        boxShadow: "0 0 6px rgba(0,0,0,0.35)",
        transform: `translate(-50%, -50%) rotate(${theta}rad)`,
        transformOrigin: "center center",
        pointerEvents: "none",
      }}
      aria-label="robot-marker"
    />
  );
};
