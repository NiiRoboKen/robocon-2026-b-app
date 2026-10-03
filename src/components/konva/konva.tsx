import { useState, useRef, useEffect } from "react";
import {
  Stage,
  Layer,
  Image,
  Line,
  Arrow,
  Rect,
  Circle,
  RegularPolygon,
} from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import { useModeStore } from "../../hooks/useController";
import { ModeTheme, setting } from "../../controller";
import { useWebSocket } from "../../websocket";

// 実フィールドの物理サイズ (mm)
const REAL_FIELD_W = setting.fieldSize.width;
const REAL_FIELD_H = setting.fieldSize.height;

// UI描画用定数
const ARROW_FIXED_LENGTH = 60; // 矢印の固定長
const DISPLAY_DURATION_MS = 1500; // 矢印を表示し続ける時間

const NO_ENTRY_ZONES = [
  { minX: 0, maxX: 925, minY: 0, maxY: 1125 },
  { minX: 1115, maxX: 2575, minY: 2125, maxY: 3785 },
  { minX: 3565, maxX: 4875, minY: 3325, maxY: 4635 },
  { minX: 15, maxX: 1425, minY: 5115, maxY: 6485 },
  { minX: 1975, maxX: 3375, minY: 5100, maxY: 6500 },
  { minX: 4185, maxX: 5475, minY: 5155, maxY: 6445 },
  { minX: 3565, maxX: 4875, minY: 6965, maxY: 8275 },
  { minX: 1115, maxX: 2575, minY: 7815, maxY: 9475 },
  { minX: 3950, maxX: 5300, minY: 0, maxY: 1275 },
  { minX: 4925, maxX: 5700, minY: 0, maxY: 10500 },
];
const CIRCLE_OBSTACLES = [
  {
    // 青フィールド右端(REAL_FIELD_W)からさらに右へ2800の位置
    centerX: REAL_FIELD_W + 2800,
    centerY: 5700 + 50,
    radius: 3500,
  },
];

const SetLocation = () => {
  const { mode } = useModeStore();
  const colorTheme = ModeTheme[mode];
  const [fieldImage] = useImage(colorTheme.fieldImageSrc);

  const { sendMessage } = useWebSocket();
  // 画面上のドラッグ開始・現在座標
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const timeoutRef = useRef<number | null>(null);

  //タイマー初期化
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handlePointerDown = (
    e: Konva.KonvaEventObject<PointerEvent | MouseEvent | TouchEvent>,
  ) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

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
    if (!startPos || timeoutRef.current) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (pos) {
      setCurrentPos(pos);
    }
  };

  // スクリーン座標とフィールドの物理座標変換
  const toScreenScaleX = setting.fieldSizeScale.width / REAL_FIELD_W;
  const toScreenScaleY = setting.fieldSizeScale.height / REAL_FIELD_H;

  // 赤モード時はオフセットを +200 に反転
  const VISUAL_OFFSET_X = mode === "red" ? 260 : -260;
  const VISUAL_OFFSET_Y = 0;

  // 補正の基準は常に教壇側
  const X_ANCHOR = mode === "red" ? 0 : REAL_FIELD_W;
  const X_SCALE_FIX = 0.96;

  const getScreenX = (physicalX: number) => {
    const displayX = mode === "red" ? REAL_FIELD_W - physicalX : physicalX;
    const fixedX = X_ANCHOR + (displayX - X_ANCHOR) * X_SCALE_FIX;
    return (fixedX + VISUAL_OFFSET_X) * toScreenScaleX;
  };

  const getScreenY = (physicalY: number) => {
    return (REAL_FIELD_H - (physicalY + VISUAL_OFFSET_Y)) * toScreenScaleY;
  };

  const handlePointerUp = () => {
    if (!startPos || !currentPos) return;

    const displayXRaw = startPos.x / toScreenScaleX - VISUAL_OFFSET_X;
    const realX = X_ANCHOR + (displayXRaw - X_ANCHOR) / X_SCALE_FIX;
    const realY = REAL_FIELD_H - startPos.y / toScreenScaleY - VISUAL_OFFSET_Y;

    let targetDegree = 0;
    const dx = currentPos.x - startPos.x;
    const dy = currentPos.y - startPos.y;

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      targetDegree = Math.atan2(-dx, -dy) * (180 / Math.PI);
    }

    sendMessage({
      command: "navigate",
      x: Math.round(realX),
      y: Math.round(realY),
      degree: Math.round(targetDegree),
      theme: mode,
    });

    timeoutRef.current = setTimeout(() => {
      setStartPos(null);
      setCurrentPos(null);
    }, DISPLAY_DURATION_MS);
  };

  // 描画用 固定長矢印座標
  const getFixedArrowPoints = () => {
    if (!startPos || !currentPos) return [];

    const dx = currentPos.x - startPos.x;
    const dy = currentPos.y - startPos.y;
    const distance = Math.hypot(dx, dy);
    // ドラッグ距離が短い場合
    if (distance < 5) {
      return [];
    }

    const endX = startPos.x + (dx / distance) * ARROW_FIXED_LENGTH;
    const endY = startPos.y + (dy / distance) * ARROW_FIXED_LENGTH;

    return [startPos.x, startPos.y, endX, endY];
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

        {/* NO_ENTRY_ZONES の描画 */}
        {NO_ENTRY_ZONES.map((zone, index) => {
          const screenX1 = getScreenX(zone.minX);
          const screenX2 = getScreenX(zone.maxX);

          const leftX = Math.min(screenX1, screenX2);
          const width = Math.abs(screenX2 - screenX1);

          const screenYTop = getScreenY(zone.maxY);
          const screenYBottom = getScreenY(zone.minY);
          const height = Math.abs(screenYBottom - screenYTop);

          return (
            <Rect
              key={index}
              x={leftX}
              y={screenYTop}
              width={width}
              height={height}
              fill="rgba(61, 61, 61, 0.4)"
              listening={false}
            />
          );
        })}

        {/* CIRCLE_OBSTACLES の描画 */}
        {CIRCLE_OBSTACLES.map((obstacle, index) => {
          const screenX = getScreenX(obstacle.centerX);
          const screenY = getScreenY(obstacle.centerY);
          const screenRadius = obstacle.radius * toScreenScaleX;

          return (
            <Circle
              key={`circle-${index}`}
              x={screenX}
              y={screenY}
              radius={screenRadius}
              stroke="rgba(52, 49, 34, 0.8)"
              strokeWidth={3}
              listening={false}
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

        {/* 水色矢印の描画 */}
        {(() => {
          const targetX = 4583.1;
          const targetY = 4938.9;
          const targetTheta = 11.7;

          // 赤陣地モード時の見た目の角度反転
          const displayTheta = mode === "red" ? targetTheta : targetTheta;

          const screenX = getScreenX(targetX);
          const screenY = getScreenY(targetY);
          const arrowLength = 60;

          const rad = (displayTheta * Math.PI) / 180;
          const dx =
            mode === "red"
              ? -Math.cos(rad) * arrowLength
              : Math.cos(rad) * arrowLength;
          const dy = -Math.sin(rad) * arrowLength;

          return (
            <Arrow
              x={screenX}
              y={screenY}
              points={[0, 0, dx, dy]}
              stroke="#00FFFF"
              fill="#00FFFF"
              strokeWidth={4}
              pointerLength={10}
              pointerWidth={10}
              opacity={1.0}
              listening={false}
            />
          );
        })()}

        {/* 距離に応じて三角形 または 矢印を描画 */}
        {startPos &&
          currentPos &&
          (() => {
            const distance = Math.hypot(
              currentPos.x - startPos.x,
              currentPos.y - startPos.y,
            );

            if (distance < 5) {
              return (
                <RegularPolygon
                  x={startPos.x}
                  y={startPos.y}
                  sides={3}
                  radius={8}
                  fill="#FFFF00"
                  opacity={0.8}
                />
              );
            }

            return (
              <Arrow
                points={getFixedArrowPoints()}
                stroke="#FFFF00"
                fill="#FFFF00"
                strokeWidth={4}
                pointerLength={10}
                pointerWidth={10}
                opacity={0.8}
              />
            );
          })()}
      </Layer>
    </Stage>
  );
};

export default SetLocation;
