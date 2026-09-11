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

export const Preset = () => {
  const [distance, setDistance] = useState(100);
  const [angleStep, setAngleStep] = useState(15);

  const { sendMessage } = useWebSocket();
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
      case "stop":
        moveX = 0;
        moveY = 0;
        break;
    }
    sendMessage({
      command: "set_location",
      x: moveX,
      y: moveY,
      degree: 0,
    });
  };

  const handleRotate = (direction: "ccw" | "cw") => {
    let moveTheta = 0;

    if (direction === "ccw") {
      moveTheta = angleStep;
    } else if (direction === "cw") {
      moveTheta = -angleStep;
    }

    sendMessage({
      command: "set_location",
      x: 0,
      y: 0,
      degree: moveTheta,
    });
  };

  return (
    <VStack borderWidth="1px" borderRadius="md" p={4} align="stretch" gap={6}>
      <Box>
        <Text fontSize="sm" fontWeight="bold" mb={8}>
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
                mb="8px"
                fontSize="sm"
                fontWeight="bold"
                whiteSpace="nowrap"
              />
            </Slider.Thumb>
          </Slider.Control>
        </Slider.Root>
      </Box>

      <Box>
        <Text fontSize="sm" fontWeight="bold" mb={8}>
          回転角度 (度)
        </Text>
        <Slider.Root
          value={[angleStep]}
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
                mb="8px"
                fontSize="sm"
                fontWeight="bold"
                whiteSpace="nowrap"
              />
            </Slider.Thumb>
          </Slider.Control>
        </Slider.Root>
      </Box>

      <Box display="flex" justifyContent="center" alignItems="center">
        <Grid templateColumns="repeat(3, 1fr)" gap={2} w="300px">
          <GridItem colStart={2}>
            <Button
              w="100%"
              bg="blue.500"
              color="white"
              onClick={() => handleMove("up")}
            >
              前
            </Button>
          </GridItem>

          <GridItem colStart={1} rowStart={2}>
            <Button
              w="100%"
              bg="blue.500"
              color="white"
              onClick={() => handleMove("left")}
            >
              左
            </Button>
          </GridItem>
          <GridItem colStart={2} rowStart={3}>
            <Button
              w="100%"
              bg="blue.500"
              color="white"
              onClick={() => handleMove("down")}
            >
              後
            </Button>
          </GridItem>
          <GridItem colStart={3} rowStart={2}>
            <Button
              w="100%"
              bg="blue.500"
              color="white"
              onClick={() => handleMove("right")}
            >
              右
            </Button>
          </GridItem>
          <GridItem colStart={2} rowStart={2}>
            <Button
              w="100%"
              bg="red.500"
              color="white"
              onClick={() => handleMove("stop")}
            >
              停止
            </Button>
          </GridItem>
          <GridItem colStart={1} rowStart={1}>
            <Button
              w="100%"
              bg="yellow.500"
              color="white"
              onClick={() => handleRotate("ccw")}
            >
              左回転
            </Button>
          </GridItem>
          <GridItem colStart={3} rowStart={1}>
            <Button
              w="100%"
              bg="yellow.500"
              color="white"
              onClick={() => handleRotate("cw")}
            >
              右回転
            </Button>
          </GridItem>
        </Grid>
      </Box>
    </VStack>
  );
};
