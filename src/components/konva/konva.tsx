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
  { minX: 0, maxX: 950, minY: 0, maxY: 1190 },
  { minX: 990, maxX: 2500, minY: 2100, maxY: 3810 },
  { minX: 3320, maxX: 4700, minY: 3300, maxY: 4670 },
  { minX: 0, maxX: 1390, minY: 5090, maxY: 6510 },
  { minX: 1850, maxX: 3250, minY: 5070, maxY: 6530 },
  { minX: 3960, maxX: 5240, minY: 5160, maxY: 6440 },
  { minX: 3320, maxX: 4700, minY: 6930, maxY: 8300 },
  { minX: 990, maxX: 2500, minY: 7790, maxY: 9500 },
  { minX: 3700, maxX: 5100, minY: 0, maxY: 1350 },
  { minX: 4620, maxX: 5700, minY: 0, maxY: 10500 },
];

const CIRCLE_OBSTACLES = [
  {
    // フィールド右端(REAL_FIELD_W)からさらに右へ2800の位置
    centerX: REAL_FIELD_W + 2800,
    centerY: 5700 + 50,
    radius: 3500,
  },
];
// 旗から3500の位置の線 (物理座標)
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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
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
  // スクリーン座標と物理座標の変換
  const toRealScaleX = REAL_FIELD_W / setting.fieldSizeScale.width;
  const toRealScaleY = REAL_FIELD_H / setting.fieldSizeScale.height;
  // スクリーン座標とフィールドの物理座標変換
  // Y軸は画面（下向き正）とフィールド（上向き正）で反転しているため補正
  const toScreenScaleX = setting.fieldSizeScale.width / REAL_FIELD_W;
  const toScreenScaleY = setting.fieldSizeScale.height / REAL_FIELD_H;

  const handlePointerUp = () => {
    if (!startPos || !currentPos) return;

    let realX = startPos.x * toRealScaleX;
    const realY = REAL_FIELD_H - startPos.y * toRealScaleY;
    let targetDegree = 0;

    // ドラッグ時ベクトル計算
    let dx = currentPos.x - startPos.x;
    const dy = -(currentPos.y - startPos.y);

    // 赤陣地モードの場合はX座標と向きを反転して対称にする
    if (mode === "red") {
      realX = REAL_FIELD_W - realX;
      dx = -dx;
    }
    // 誤操作防止用（5px以上ドラッグした場合のみ角度を計算）
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      targetDegree = Math.atan2(-dx, dy) * (180 / Math.PI);
    }

    sendMessage({
      command: "navigate",
      x: Math.round(realX),
      y: Math.round(realY),
      degree: Math.round(targetDegree),
      theme: mode,
    });
    // 送信後、一定時間UI上に指示内容を残してから消去する
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
        {NO_ENTRY_ZONES.map((zone, index) => {
          let x = zone.minX;
          const w = zone.maxX - zone.minX;
          const h = zone.maxY - zone.minY;

          // 赤陣地の場合はX座標を反転 (右端の座標基準)
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
              fill="rgba(61, 61, 61, 0.4)" // 半透明の赤色
              listening={false} // クリックイベントをブロックしない設定
            />
          );
        })}

        {/* 線のみの円を描画 */}
        {CIRCLE_OBSTACLES.map((obstacle, index) => {
          let x = obstacle.centerX;
          if (mode === "red") {
            // 赤陣地モードの場合中心座標も反転（左側）
            x = REAL_FIELD_W - obstacle.centerX;
          }
          const screenY = (REAL_FIELD_H - obstacle.centerY) * toScreenScaleY;
          const screenRadius = obstacle.radius * toScreenScaleX;

          return (
            <Circle
              key={`circle-${index}`}
              x={x * toScreenScaleX}
              y={screenY}
              radius={screenRadius}
              stroke="rgba(52, 49, 34, 0.8)" // 線の色
              strokeWidth={3} // 線の太さ
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

        {(() => {
          // 指定された物理座標 (mm) と角度
          const targetX = 4583.1;
          const targetY = 4938.9;
          const targetTheta = 11.7; // θ=166.0°

          // 赤陣地モード時の座標反転
          let displayX = targetX;
          let displayTheta = targetTheta;
          if (mode === "red") {
            displayX = REAL_FIELD_W - targetX;
            displayTheta = 180 - targetTheta;
          }

          // 物理座標からスクリーン座標 (px) への変換
          const screenX = displayX * toScreenScaleX;
          const screenY = (REAL_FIELD_H - targetY) * toScreenScaleY;

          // 矢印のスクリーン上の長さ(px)
          const arrowLength = 60;

          // スクリーン座標系（Y軸下向き正）での終点計算
          const rad = (displayTheta * Math.PI) / 180;
          const dx = Math.cos(rad) * arrowLength;
          const dy = -Math.sin(rad) * arrowLength; // Y軸は下が正なのでマイナスにする

          return (
            <Arrow
              x={screenX}
              y={screenY}
              points={[0, 0, dx, dy]}
              stroke="#00FFFF" // 目立つようにシアン（水色）
              fill="#00FFFF"
              strokeWidth={4}
              pointerLength={10}
              pointerWidth={10}
              opacity={1.0}
              listening={false} // クリックイベントの妨げにならないようにする
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
              // タップ時は上向き（0度）の三角形のみを表示
              return (
                <RegularPolygon
                  x={startPos.x}
                  y={startPos.y}
                  sides={3}
                  radius={8} // 三角形の大きさ
                  fill="#FFFF00"
                  opacity={0.8}
                  // ※ Konvaの RegularPolygon(sides={3}) はデフォルトで真上を向きます
                />
              );
            }

            // ドラッグ時はこれまで通りの棒付き矢印
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
