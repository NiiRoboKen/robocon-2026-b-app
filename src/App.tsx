import { useEffect, useMemo, useRef, useState } from "react";

import SetLocation from "./components/konva/konva.tsx";
import { Robot } from "./components/robot/Robot.tsx";
import { RobotCoordinate } from "./components/robot-coordinate/RobotCoordinate.tsx";
import { useWebSocket } from "./websocket";

import {
  ChakraProvider,
  defaultSystem,
  Box,
  HStack,
  VStack,
} from "@chakra-ui/react";

import { BeltoOutputSlider } from "./components/Belt-output-slider/Belt-output-slider.tsx";
import { Preset } from "./components/preset/Preset.tsx";
import ChangeThemeButton from "./components/change-theme-button/ChangeThemeButton.tsx";
import AllStopButton from "./components/stop-button/StopButton.tsx";
import { LaunchButton } from "./components/Launch-button/LaunchButton.tsx";
import { useModeStore } from "./hooks/useController.ts";

type ThemeType = "blue" | "red";

type Pose = {
  x: number;
  y: number;
  theta: number;
};

const FIELD_W = 6000;
const ORIGIN_X = 1800;
const ORIGIN_Y = 500;

const App = () => {
  const { connect, disconnect } = useWebSocket();
  const { mode } = useModeStore();

  const theme = mode as ThemeType;

  const initialPose = useMemo<Pose>(() => {
    if (theme === "blue") {
      return {
        x: ORIGIN_X,
        y: ORIGIN_Y,
        theta: 0,
      };
    }

    return {
      x: FIELD_W - ORIGIN_X,
      y: ORIGIN_Y,
      theta: 0,
    };
  }, [theme]);

  const [pose, setPose] = useState<Pose>(initialPose);

  const fieldRef = useRef<HTMLDivElement>(null);

  const [fieldSize, setFieldSize] = useState({
    w: 1,
    h: 1,
  });

  useEffect(() => {
    setPose(initialPose);
  }, [initialPose]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  useEffect(() => {
    const el = fieldRef.current;

    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();

      setFieldSize({
        w: rect.width,
        h: rect.height,
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  const displayCoord = useMemo(() => {
    if (theme === "blue") {
      return {
        x: pose.x - ORIGIN_X,
        y: pose.y - ORIGIN_Y,
      };
    }

    return {
      x: FIELD_W - pose.x - ORIGIN_X,
      y: pose.y - ORIGIN_Y,
    };
  }, [pose, theme]);

  return (
    <ChakraProvider value={defaultSystem}>
      <Box
        w="100vw"
        h="100dvh"
        m={0}
        p={0}
        overflow="hidden"
        touchAction="none"
        overscrollBehavior="none"
      >
        <HStack
          w="100%"
          h="100%"
          gap={0}
          m={0}
          p={0}
          align="stretch"
          overflow="hidden"
        >
          <VStack
            w="60%"
            h="100%"
            minW={0}
            minH={0}
            gap={0}
            m={0}
            p={0}
            align="stretch"
            overflow="hidden"
          >
            <Box
              ref={fieldRef}
              flex="1"
              minW={0}
              minH={0}
              position="relative"
              overflow="hidden"
              m={0}
              p={0}
            >
              <SetLocation />

              <Robot
                x={pose.x}
                y={pose.y}
                theta={pose.theta}
                theme={theme}
                imageSrc={
                  theme === "blue"
                    ? "/fieldBlueImage.png"
                    : "/fieldRedImage.png"
                }
              />
            </Box>
          </VStack>

          <VStack
            w="40%"
            h="100%"
            minW={0}
            minH={0}
            align="stretch"
            justify="flex-start"
            gap={4}
            m={0}
            p={4}
            overflow="hidden"
          >
            <Box flexShrink={0} m={0} p={0}>
              <RobotCoordinate
                x={displayCoord.x}
                y={displayCoord.y}
                theta={pose.theta}
                connected={true}
              />
            </Box>

            <AllStopButton />
            <ChangeThemeButton />
            <BeltoOutputSlider />
            <LaunchButton />
            <Preset />
          </VStack>
        </HStack>
      </Box>
    </ChakraProvider>
  );
};

export default App;
