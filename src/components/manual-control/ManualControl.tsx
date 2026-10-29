import { Box, Grid, GridItem, Slider, Text, VStack } from "@chakra-ui/react";
import { useWebSocket } from "../../websocket";
import { useRef, useState, useEffect } from "react";
import "./ManualControl.css";

export const ManualControl = () => {
  const [pwm, setPwm] = useState(500);
  const [flashBtn, setFlashBtn] = useState<string | null>(null);
  const { sendMessage } = useWebSocket();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const startMove = (
    direction: "up" | "down" | "left" | "right" | "ccw" | "cw",
  ) => {
    setFlashBtn(direction);
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
    setFlashBtn(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      sendMessage({
        command: "manual_move",
        vx: 0,
        vy: 0,
        vtheta: 0,
      });
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
    className: `controller-button ${
      dir === "ccw" || dir === "cw" ? "rotate-button" : "move-button"
    } ${flashBtn === dir ? "button-flash" : ""}`,
    style: {
      userSelect: "none" as const,
      touchAction: "none" as const,
    },
  });

  return (
    <VStack className="manual-control" p={3} align="stretch" gap={4} w="100%">
      <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
        {/* PWMスライダー */}
        <Box w="100%" maxW="280px" className="slider-section">
          <Text className="slider-label" fontSize="xs" fontWeight="bold" mb={1}>
            MANUAL PWM <span className="slider-unit">{pwm}</span>
          </Text>
          <Slider.Root
            defaultValue={[500]}
            min={100}
            max={600}
            step={10}
            onValueChange={(e) => setPwm(e.value[0])}
          >
            <Slider.Control>
              <Slider.Track>
                <Slider.Range />
              </Slider.Track>
              <Slider.Thumb index={0} />
            </Slider.Control>
          </Slider.Root>
        </Box>

        {/* コントローラーグリッド */}
        <Grid templateColumns="repeat(3, 1fr)" gap={2} w="100%" maxW="280px">
          {/* 上段 */}
          <GridItem colStart={1} rowStart={1}>
            <button {...bindEvents("ccw")}>
              <span className="arrow">↺</span>
            </button>
          </GridItem>
          <GridItem colStart={2} rowStart={1}>
            <button {...bindEvents("up")}>
              <span className="arrow">▲</span>
            </button>
          </GridItem>
          <GridItem colStart={3} rowStart={1}>
            <button {...bindEvents("cw")}>
              <span className="arrow">↻</span>
            </button>
          </GridItem>

          {/* 中段 */}
          <GridItem colStart={1} rowStart={2}>
            <button {...bindEvents("left")}>
              <span className="arrow">◀</span>
            </button>
          </GridItem>
          <GridItem colStart={3} rowStart={2}>
            <button {...bindEvents("right")}>
              <span className="arrow">▶</span>
            </button>
          </GridItem>

          {/* 下段 */}
          <GridItem colStart={2} rowStart={3}>
            <button {...bindEvents("down")}>
              <span className="arrow">▼</span>
            </button>
          </GridItem>
        </Grid>
      </Box>
    </VStack>
  );
};
