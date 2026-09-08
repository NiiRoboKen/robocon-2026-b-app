type ThemeType = "blue" | "red";

type RobotProps = {
  x: number;
  y: number;
  theme: ThemeType;
  stageWidthPx: number;
  stageHeightPx: number;
  theta?: number;
};

const FIELD_W = 6000;
const FIELD_H = 10500;

const ORIGIN_X = 1800;
const ORIGIN_Y = 500;

const ROBOT_W = 950;
const ROBOT_H = 950;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export default function Robot({
  x,
  y,
  theme,
  stageWidthPx,
  stageHeightPx,
  theta = 0,
}: RobotProps) {
  // ロボット座標 → フィールド座標
  let rawX: number;
  let rawY: number;

  if (theme === "blue") {
    rawX = x + ORIGIN_X;
  } else {
    rawX = FIELD_W - (x + ORIGIN_X);
  }

  rawY = y + ORIGIN_Y;

  // フィールド外に出ないようにする
  rawX = clamp(rawX, 0, FIELD_W);
  rawY = clamp(rawY, 0, FIELD_H);

  // フィールド座標 → 画面座標
  //
  // フィールド画像は右下原点として扱っているため、
  // x/yを反転して画面上の座標に変換する
  const mmLeft = FIELD_W - rawX;
  const mmTop = FIELD_H - rawY;

  const leftPx = (mmLeft / FIELD_W) * stageWidthPx;
  const topPx = (mmTop / FIELD_H) * stageHeightPx;

  // ロボットサイズを画面サイズに変換
  const robotWPx = (ROBOT_W / FIELD_W) * stageWidthPx;
  const robotHPx = (ROBOT_H / FIELD_H) * stageHeightPx;

  return (
    <div
      style={{
        position: "absolute",

        left: leftPx,
        top: topPx,

        width: robotWPx,
        height: robotHPx,

        transform: `translate(-50%, -50%) rotate(${theta}rad)`,
        transformOrigin: "center center",

        background: "rgba(255, 59, 48, 0.75)",
        border: "2px solid #fff",
        boxShadow: "0 0 8px rgba(0,0,0,0.35)",

        // ロボット自体はタッチ操作の対象にしない
        pointerEvents: "none",
      }}
    />
  );
}
