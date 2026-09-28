import {
  Box,
  Grid,
  GridItem,
  Button,
  Slider,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useWebSocket } from "../../websocket";
import { useRef, useState } from "react";

export const ManualControl = () => {
  const [pwm, setPwm] = useState(500);
  const { sendMessage } = useWebSocket();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startMove = (
    direction: "up" | "down" | "left" | "right" | "ccw" | "cw",
  ) => {
    let vx = 0,
      vy = 0,
      vtheta = 0;
    switch (direction) {
      case "up":
        vx = pwm;
        break;
      case "down":
        vx = -pwm;
        break;
      case "left":
        vy = pwm;
        break;
      case "right":
        vy = -pwm;
        break;
      case "ccw":
        vtheta = pwm;
        break;
      case "cw":
        vtheta = -pwm;
        break;
    }

    if (intervalRef.current) clearInterval(intervalRef.current);

    const send = () => sendMessage({ command: "manual_move", vx, vy, vtheta });
    send();
    intervalRef.current = setInterval(send, 100);
  };

  const stopMove = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      sendMessage({ command: "manual_move", vx: 0, vy: 0, vtheta: 0 });
    }
  };

  const bindEvents = (
    dir: "up" | "down" | "left" | "right" | "ccw" | "cw",
  ) => ({
    onMouseDown: () => startMove(dir),
    onMouseUp: stopMove,
    onMouseLeave: stopMove,
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault();
      startMove(dir);
    },
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault();
      stopMove();
    },
    style: { userSelect: "none" as const, touchAction: "none" as const },
  });

  return (
    <VStack borderWidth="1px" borderRadius="md" p={4} align="stretch" gap={6}>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap={6}
      >
        <Box w="100%" maxW="300px">
          <Text fontSize="sm" fontWeight="bold" mb={2}>
            PWM
          </Text>
          <Slider.Root
            defaultValue={[500]}
            min={100}
            max={1000}
            step={10}
            onValueChange={(e) => setPwm(e.value[0])}
            colorPalette="yellow"
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

        <Grid templateColumns="repeat(3, 1fr)" gap={2} w="300px">
          <GridItem colStart={2}>
            <Button w="100%" bg="blue.500" color="white" {...bindEvents("up")}>
              前
            </Button>
          </GridItem>
          <GridItem colStart={1} rowStart={2}>
            <Button
              w="100%"
              bg="blue.500"
              color="white"
              {...bindEvents("left")}
            >
              左
            </Button>
          </GridItem>
          <GridItem colStart={2} rowStart={3}>
            <Button
              w="100%"
              bg="blue.500"
              color="white"
              {...bindEvents("down")}
            >
              後
            </Button>
          </GridItem>
          <GridItem colStart={3} rowStart={2}>
            <Button
              w="100%"
              bg="blue.500"
              color="white"
              {...bindEvents("right")}
            >
              右
            </Button>
          </GridItem>
          <GridItem colStart={1} rowStart={1}>
            <Button
              w="100%"
              bg="yellow.500"
              color="white"
              {...bindEvents("ccw")}
            >
              左回転
            </Button>
          </GridItem>
          <GridItem colStart={3} rowStart={1}>
            <Button
              w="100%"
              bg="yellow.500"
              color="white"
              {...bindEvents("cw")}
            >
              右回転
            </Button>
          </GridItem>
        </Grid>
      </Box>
    </VStack>
  );
};
