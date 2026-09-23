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
// 物理座標受け取り ロボット描画
export const Robot = ({ x, y, theta = 0, theme }: RobotProps) => {
  // 実フィールド (mm)
  const FIELD_WIDTH_MM = setting.fieldSize.width;
  const FIELD_HEIGHT_MM = setting.fieldSize.height;

  // UI描画領域のスクリーンサイズ (px)
  const displayWidth = setting.fieldSizeScale.width;
  const displayHeight = setting.fieldSizeScale.height;

  // フィールドサイズを超えないように制限
  let fieldX = clamp(x, 0, FIELD_WIDTH_MM);
  const fieldY = clamp(y, 0, FIELD_HEIGHT_MM);
  let displayTheta = theta;

  // 画面の中央を軸にX座標と角度を左右反転
  if (theme === "red") {
    fieldX = FIELD_WIDTH_MM - fieldX;
    displayTheta = 180 - theta;
  }
  // 物理座標(mm)からスクリーン座標(px)への変換
  const px = (fieldX / FIELD_WIDTH_MM) * displayWidth;
  const py = displayHeight - (fieldY / FIELD_HEIGHT_MM) * displayHeight;

  // 本体の物理サイズをスクリーンサイズの変換
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
        // 要素の中心を基準に配置 指定角度で回転
        transform: `translate(-50%, -50%) rotate(${-displayTheta}deg)`,
        transformOrigin: "center center",
        background: "#00ff7f",
        boxSizing: "border-box",
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 10,
      }}
    />
  );
};
