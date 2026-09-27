import { Box, Grid, GridItem, Button, VStack } from "@chakra-ui/react";
import { useWebSocket } from "../../websocket";
import { useRef } from "react";

export const ManualControl = () => {
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
        vx = 1;
        break;
      case "down":
        vx = -1;
        break;
      case "left":
        vy = 1;
        break;
      case "right":
        vy = -1;
        break;
      case "ccw":
        vtheta = 1;
        break;
      case "cw":
        vtheta = -1;
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
      <Box display="flex" justifyContent="center" alignItems="center">
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
