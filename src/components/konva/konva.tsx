import { useState } from "react";
import { Stage, Layer, Image, Line, Arrow } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import { useModeStore } from "../../hooks/useController";
import { ModeTheme, setting } from "../../controller";
import { useWebSocket } from "../../websocket";

const REAL_FIELD_W = 5700;
const REAL_FIELD_H = 10500;

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

  const handlePointerUp = () => {
    if (!startPos || !currentPos) return;

    const scaleX = REAL_FIELD_W / setting.fieldSizeScale.width;
    const scaleY = REAL_FIELD_H / setting.fieldSizeScale.height;

    let realX = startPos.x * scaleX;
    const realY = startPos.y * scaleY;
    let targetDegree = 0;

    let dx = currentPos.x - startPos.x;
    const dy = currentPos.y - startPos.y;

    if (mode === "red") {
      // X座標と、X方向のベクトルを反転
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
