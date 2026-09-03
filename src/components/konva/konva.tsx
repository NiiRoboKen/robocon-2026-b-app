import Konva from "konva";
import { useRef } from "react";
import { Stage, Layer, Line, Image } from "react-konva";
import { setting, ModeTheme } from "../../controller";
import { useModeStore } from "../../hooks/useController";
import useImage from "use-image";

const SetLocation = () => {
  const { mode } = useModeStore();
  const colorTheme = ModeTheme[mode];

  const [fieldImage] = useImage(colorTheme.fieldImageSrc);

  const stageRef = useRef<Konva.Stage | null>(null);

  return (
    <Stage
      width={setting.fieldSizeScale.width}
      height={setting.fieldSizeScale.height}
      ref={stageRef}
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
        />
      </Layer>
    </Stage>
  );
};

export default SetLocation;
