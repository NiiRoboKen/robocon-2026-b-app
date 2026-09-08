import { useEffect, useState } from "react";

export type FieldTheme = "red" | "blue";

type RobotProps = {
  x: number;
  y: number;
  theta?: number;
  theme: FieldTheme;
  imageSrc: string;
};

const FIELD_WIDTH_MM = 6000;
const FIELD_HEIGHT_MM = 10500;

const ROBOT_SIZE_MM = 950;

const RED_ORIGIN_X_MM = 1800;
const RED_ORIGIN_Y_MM = 500;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const Robot = ({ x, y, theta = 0, theme, imageSrc }: RobotProps) => {
  const [imageSize, setImageSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const image = new Image();

    image.onload = () => {
      setImageSize({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };

    image.src = imageSrc;
  }, [imageSrc]);

  if (imageSize.width === 0 || imageSize.height === 0) {
    return null;
  }

  let fieldX: number;

  if (theme === "red") {
    fieldX = x + RED_ORIGIN_X_MM;
  } else {
    fieldX = FIELD_WIDTH_MM - (x + RED_ORIGIN_X_MM);
  }

  const fieldY = y + RED_ORIGIN_Y_MM;

  const clampedX = clamp(fieldX, 0, FIELD_WIDTH_MM);
  const clampedY = clamp(fieldY, 0, FIELD_HEIGHT_MM);

  const px = (clampedX / FIELD_WIDTH_MM) * imageSize.width;

  const py = imageSize.height - (clampedY / FIELD_HEIGHT_MM) * imageSize.height;

  const robotSizePx = (ROBOT_SIZE_MM / FIELD_WIDTH_MM) * imageSize.width;

  return (
    <div
      style={{
        position: "absolute",

        left: px,
        top: py,

        width: robotSizePx,
        height: robotSizePx,

        transform: `
          translate(-50%, -50%)
          rotate(${theta}deg)
        `,

        transformOrigin: "center center",

        background: "rgba(48, 255, 93, 0.75)",
        border: "2px solid white",
        boxSizing: "border-box",

        pointerEvents: "none",
        userSelect: "none",
      }}
    />
  );
};
