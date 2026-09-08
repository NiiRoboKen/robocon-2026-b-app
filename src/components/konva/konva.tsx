import { useModeStore } from "../../hooks/useController";
import { ModeTheme, setting } from "../../controller";
import { Stage, Layer, Image, Line } from "react-konva";
import useImage from "use-image";

const SetLocation = () => {
  const { mode } = useModeStore();
  const colorTheme = ModeTheme[mode];

  const [fieldImage] = useImage(colorTheme.fieldImageSrc);

  return (
    <Stage
      width={setting.fieldSizeScale.width}
      height={setting.fieldSizeScale.height}
    >
      <Layer>
        {/* フィールド画像 */}
        <Image
          image={fieldImage}
          x={0}
          y={0}
          width={setting.fieldSizeScale.width}
          height={setting.fieldSizeScale.height}
        />

        {/* フィールドの囲い */}
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
      </Layer>
    </Stage>
  );
};

export default SetLocation;
