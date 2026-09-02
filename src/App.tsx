import { useEffect, useRef, useState } from "react";
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

type Pose = {
  x: number;
  y: number;
  theta?: number;
};

const App = () => {
  const { connect, disconnect } = useWebSocket();

  const [pose] = useState<Pose>({ x: 0, y: 0, theta: 0 });

  const fieldRef = useRef<HTMLDivElement>(null);
  const [fieldSize, setFieldSize] = useState({ w: 1, h: 1 });

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  useEffect(() => {
    const el = fieldRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setFieldSize({ w: rect.width, h: rect.height });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <ChakraProvider value={defaultSystem}>
      <HStack w="100vw" h="100vh" gap={0} align="stretch" overflow="hidden">
        <VStack w="60%" h="100%" gap={0} align="stretch">
          <Box
            ref={fieldRef}
            w="100%"
            flex="1"
            position="relative"
            overflow="hidden"
          >
            <SetLocation />

            <Robot
              x={pose.x}
              y={pose.y}
              theta={pose.theta}
              fieldWidthPx={fieldSize.w}
              fieldHeightPx={fieldSize.h}
            />
          </Box>

          <Box p={2}>
            <RobotCoordinate
              x={pose.x}
              y={pose.y}
              theta={pose.theta}
              connected={true}
            />
          </Box>
        </VStack>

        <VStack
          w="40%"
          h="100%"
          align="stretch"
          justify="flex-start"
          gap={4}
          p={4}
        >
          <ChangeThemeButton />
          <BeltoOutputSlider />
          <Preset />
        </VStack>
      </HStack>
    </ChakraProvider>
  );
};

export default App;
