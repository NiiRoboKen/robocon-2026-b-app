import { useState } from "react";
import { Stage, Layer, Image, Line, Arrow, Rect } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import { useModeStore } from "../../hooks/useController";
import { ModeTheme, setting } from "../../controller";
import { useWebSocket } from "../../websocket";

const REAL_FIELD_W = setting.fieldSize.width;
const REAL_FIELD_H = setting.fieldSize.height;

const NO_ENTRY_ZONES = [
  { minX: 0, maxX: 450, minY: 0, maxY: 690 },
  { minX: 1490, maxX: 2000, minY: 2600, maxY: 3310 },
  { minX: 3820, maxX: 4200, minY: 3800, maxY: 4170 },
  { minX: 490, maxX: 890, minY: 5590, maxY: 6010 },
  { minX: 2350, maxX: 2750, minY: 5570, maxY: 6030 },
  { minX: 4460, maxX: 4740, minY: 5660, maxY: 5940 },
  { minX: 3820, maxX: 4200, minY: 7430, maxY: 7800 },
  { minX: 1490, maxX: 2000, minY: 8290, maxY: 9000 },
];

const SetLocation = () => {
  const { mode } = useModeStore();
  const colorTheme = ModeTheme[mode];
  const [fieldImage] = useImage(colorTheme.fieldImageSrc);

  const { sendMessage } = useWebSocket();

  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(
    null,
  );

  const handlePointerDown = (
    e: Konva.KonvaEventObject<PointerEvent | MouseEvent | TouchEvent>,
  ) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (pos) {
      setStartPos(pos);
      setCurrentPos(pos);
    }
  };

  const handlePointerMove = (
    e: Konva.KonvaEventObject<PointerEvent | MouseEvent | TouchEvent>,
  ) => {
    if (!startPos) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (pos) {
      setCurrentPos(pos);
    }
  };
  const toRealScaleX = REAL_FIELD_W / setting.fieldSizeScale.width;
  const toRealScaleY = REAL_FIELD_H / setting.fieldSizeScale.height;

  const toScreenScaleX = setting.fieldSizeScale.width / REAL_FIELD_W;
  const toScreenScaleY = setting.fieldSizeScale.height / REAL_FIELD_H;

  const handlePointerUp = () => {
    if (!startPos || !currentPos) return;

    let realX = startPos.x * toRealScaleX;
    const realY = REAL_FIELD_H - startPos.y * toRealScaleY;
    let targetDegree = 0;

    let dx = currentPos.x - startPos.x;
    const dy = -(currentPos.y - startPos.y);

    if (mode === "red") {
      realX = REAL_FIELD_W - realX;
      dx = -dx;
    }

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      targetDegree = Math.atan2(dy, dx) * (180 / Math.PI);
    }

    sendMessage({
      command: "navigate",
      x: Math.round(realX),
      y: Math.round(realY),
      degree: Math.round(targetDegree),
    });

    setStartPos(null);
    setCurrentPos(null);
  };

  return (
    <Stage
      width={setting.fieldSizeScale.width}
      height={setting.fieldSizeScale.height}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
    >
      <Layer>
        <Image
          image={fieldImage}
          x={0}
          y={0}
          width={setting.fieldSizeScale.width}
          height={setting.fieldSizeScale.height}
        />
        {NO_ENTRY_ZONES.map((zone, index) => {
          let x = zone.minX;
          const w = zone.maxX - zone.minX;
          const h = zone.maxY - zone.minY;

          // 赤陣地の場合はX座標を反転 (右端の座標を基準にする)
          if (mode === "red") {
            x = REAL_FIELD_W - zone.maxX;
          }
          const screenY = (REAL_FIELD_H - zone.maxY) * toScreenScaleY;
          return (
            <Rect
              key={index}
              x={x * toScreenScaleX}
              y={screenY}
              width={w * toScreenScaleX}
              height={h * toScreenScaleY}
              fill="rgba(52, 49, 34, 0.4)" // 半透明の赤色
              listening={false} // クリックイベントをブロックしない設定
            />
          );
        })}

        <Line
          points={[
            0,
            0,
            setting.fieldSizeScale.width,
            0,
            setting.fieldSizeScale.width,
            setting.fieldSizeScale.height,
            0,
            setting.fieldSizeScale.height,
            0,
            0,
          ]}
          stroke={colorTheme.colors.other}
          strokeWidth={10}
          closed
        />

        {startPos && currentPos && (
          <Arrow
            points={[startPos.x, startPos.y, currentPos.x, currentPos.y]}
            stroke="#FFFF00"
            fill="#FFFF00"
            strokeWidth={4}
            pointerLength={10}
            pointerWidth={10}
            opacity={0.8}
          />
        )}
      </Layer>
    </Stage>
  );
};

export default SetLocation;
