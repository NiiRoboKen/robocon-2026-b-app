import {
  Box,
  Grid,
  GridItem,
  Button,
  Slider,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { useWebSocket } from "../../websocket";
import "./Preset.css";

export const Preset = () => {
  const [distance, setDistance] = useState(100);
  const [angleStep, setAngleStep] = useState(15);

  // 押したボタンを一時的に発光させる
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const { sendMessage } = useWebSocket();

  const flashButton = (button: string) => {
    setActiveButton(button);

    setTimeout(() => {
      setActiveButton(null);
    }, 250);
  };

  const handleMove = (direction: "up" | "down" | "left" | "right" | "stop") => {
    let moveX = 0;
    let moveY = 0;

    switch (direction) {
      case "up":
        moveX = distance;
        break;

      case "down":
        moveX = -distance;
        break;

      case "right":
        moveY = distance;
        break;

      case "left":
        moveY = -distance;
        break;
    }

    flashButton(direction);

    sendMessage({
      command: "set_location",
      x: moveX,
      y: moveY,
      degree: 0,
    });
  };

  const handleRotate = (direction: "ccw" | "cw") => {
    const moveTheta = direction === "ccw" ? angleStep : -angleStep;

    flashButton(direction);

    sendMessage({
      command: "set_location",
      x: 0,
      y: 0,
      degree: moveTheta,
    });
  };

  return (
    <VStack
      className="preset"
      borderWidth="1px"
      borderRadius="md"
      pt={2}
      px={2}
      align="stretch"
      gap={2}
    >
      {/* 移動距離 */}
      <Box className="slider-section">
        <Text className="slider-label" fontSize="sm" fontWeight="bold" mb={5}>
          移動距離 (mm)
        </Text>

        <Slider.Root
          defaultValue={[100]}
          min={10}
          max={1000}
          step={10}
          onValueChange={(e) => setDistance(e.value[0])}
        >
          <Slider.Control>
            <Slider.Track>
              <Slider.Range />
            </Slider.Track>

            <Slider.Thumb index={0}>
              <Slider.ValueText
                position="absolute"
                bottom="100%"
                mb="4px"
                fontSize="sm"
                fontWeight="bold"
                whiteSpace="nowrap"
              />
            </Slider.Thumb>
          </Slider.Control>
        </Slider.Root>
      </Box>

      {/* 回転角度 */}
      <Box className="slider-section">
        <Text className="slider-label" fontSize="sm" fontWeight="bold" mb={5}>
          回転角度 (°)
        </Text>

        <Slider.Root
          defaultValue={[15]}
          min={3}
          max={180}
          step={3}
          onValueChange={(e) => setAngleStep(e.value[0])}
        >
          <Slider.Control>
            <Slider.Track>
              <Slider.Range />
            </Slider.Track>

            <Slider.Thumb index={0}>
              <Slider.ValueText
                position="absolute"
                bottom="100%"
                mb="4px"
                fontSize="sm"
                fontWeight="bold"
                whiteSpace="nowrap"
              />
            </Slider.Thumb>
          </Slider.Control>
        </Slider.Root>
      </Box>

      {/* 操作ボタン */}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        className="direction-panel"
      >
        <Grid templateColumns="repeat(3, 1fr)" gap={2} w="280px">
          {/* 左回転 */}
          <GridItem colStart={1} rowStart={1}>
            <Button
              className={`controller-button rotate-button ${
                activeButton === "ccw" ? "button-flash" : ""
              }`}
              w="100%"
              onClick={() => handleRotate("ccw")}
            >
              ↺<span>左回転</span>
            </Button>
          </GridItem>

          {/* 前 */}
          <GridItem colStart={2} rowStart={1}>
            <Button
              className={`controller-button move-button ${
                activeButton === "up" ? "button-flash" : ""
              }`}
              w="100%"
              onClick={() => handleMove("up")}
            >
              <span className="arrow">▲</span>
              <span>前</span>
            </Button>
          </GridItem>

          {/* 右回転 */}
          <GridItem colStart={3} rowStart={1}>
            <Button
              className={`controller-button rotate-button ${
                activeButton === "cw" ? "button-flash" : ""
              }`}
              w="100%"
              onClick={() => handleRotate("cw")}
            >
              ↻<span>右回転</span>
            </Button>
          </GridItem>

          {/* 左 */}
          <GridItem colStart={1} rowStart={2}>
            <Button
              className={`controller-button move-button ${
                activeButton === "left" ? "button-flash" : ""
              }`}
              w="100%"
              onClick={() => handleMove("left")}
            >
              <span className="arrow">◀</span>
              <span>左</span>
            </Button>
          </GridItem>

          {/* 停止 */}
          <GridItem colStart={2} rowStart={2}>
            <Button
              className={`controller-button stop-button ${
                activeButton === "stop" ? "button-flash stop-flash" : ""
              }`}
              w="100%"
              onClick={() => handleMove("stop")}
            >
              ■<span>停止</span>
            </Button>
          </GridItem>

          {/* 右 */}
          <GridItem colStart={3} rowStart={2}>
            <Button
              className={`controller-button move-button ${
                activeButton === "right" ? "button-flash" : ""
              }`}
              w="100%"
              onClick={() => handleMove("right")}
            >
              <span className="arrow">▶</span>
              <span>右</span>
            </Button>
          </GridItem>

          {/* 後 */}
          <GridItem colStart={2} rowStart={3}>
            <Button
              className={`controller-button move-button ${
                activeButton === "down" ? "button-flash" : ""
              }`}
              w="100%"
              onClick={() => handleMove("down")}
            >
              <span className="arrow">▼</span>
              <span>後</span>
            </Button>
          </GridItem>
        </Grid>
      </Box>
    </VStack>
  );
};
