import { useEffect, useState } from "react";

type ThemeType = "blue" | "red";

type RobotProps = {
  x: number;
  y: number;
  theta?: number;
  theme: ThemeType;
  imageSrc: string;
};

const FIELD_WIDTH_MM = 6000;
const FIELD_HEIGHT_MM = 10500;

const ROBOT_WIDTH_MM = 950;
const ROBOT_HEIGHT_MM = 950;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const Robot = ({ x, y, theta = 0, imageSrc }: RobotProps) => {
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

  const fieldX = clamp(x, 0, FIELD_WIDTH_MM);
  const fieldY = clamp(y, 0, FIELD_HEIGHT_MM);

  const px = (fieldX / FIELD_WIDTH_MM) * imageSize.width;

  const py = imageSize.height - (fieldY / FIELD_HEIGHT_MM) * imageSize.height;

  const robotWidthPx = (ROBOT_WIDTH_MM / FIELD_WIDTH_MM) * imageSize.width;

  const robotHeightPx = (ROBOT_HEIGHT_MM / FIELD_HEIGHT_MM) * imageSize.height;

  return (
    <div
      style={{
        position: "absolute",
        left: px,
        top: py,
        width: robotWidthPx,
        height: robotHeightPx,
        transform: `translate(-50%, -50%) rotate(${theta}deg)`,
        transformOrigin: "center center",
        background: "#00ff7f",
        border: "2px solid white",
        boxSizing: "border-box",
        pointerEvents: "none",
        userSelect: "none",
      }}
    />
  );
};
