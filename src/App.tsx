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
// import { Preset } from "./components/preset/Preset.tsx";
import { ManualControl } from "./components/manual-control/ManualControl.tsx";
import ChangeThemeButton from "./components/change-theme-button/ChangeThemeButton.tsx";
import AllStopButton from "./components/stop-button/StopButton.tsx";
import { LaunchButton } from "./components/Launch-button/LaunchButton.tsx";
import { useModeStore } from "./hooks/useController.ts";
import ResetButton from "./components/Reset-button/ResetButton.tsx";
import { setting } from "./controller.ts";
// import { MoveAndLaunchButton } from "./components/Move-and-launch-button/MoveAndLaunchButton.tsx";
import { LoadButton } from "./components/Load-button/LoadButton.tsx";
import { FlagButton } from "./components/Flag-button/FlagButton.tsx";
import { BucketButton } from "./components/Bucket-Button/BucketButton.tsx";
import IntimidationButton from "./components/Intimidation-button/IntimidationButton.tsx";

const ORIGIN_X = 3900;
const ORIGIN_Y = 500;

const App = () => {
  const { connect, disconnect, realtimeStatus, status, espConnecting } =
    useWebSocket();
  const { mode } = useModeStore();

  const theme = mode as ThemeType;

  const fieldRef = useRef<HTMLDivElement>(null);

  const [fieldSize, setFieldSize] = useState({
    w: 1,
    h: 1,
  });

  const absolutePose = useMemo(() => {
    // 原点は赤1800、青3900で正解
    const baseOriginX =
      theme === "red" ? setting.fieldSize.width - ORIGIN_X : ORIGIN_X;
    return {
      x: baseOriginX + realtimeStatus.x,
      y: ORIGIN_Y + realtimeStatus.y,
      theta: realtimeStatus.theta,
    };
  }, [realtimeStatus, theme]);

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
  const FIELD_W_PX = setting.fieldSizeScale.width;
  const FIELD_H_PX = setting.fieldSizeScale.height;

  // 枠に収まる倍率と、中央に寄せるための余白
  const fieldScale = Math.min(
    fieldSize.w / FIELD_W_PX,
    fieldSize.h / FIELD_H_PX,
  );
  const offsetX = (fieldSize.w - FIELD_W_PX * fieldScale) / 2;
  const offsetY = (fieldSize.h - FIELD_H_PX * fieldScale) / 2;

  type ThemeType = "blue" | "red";

  type Pose = {
    x: number;
    y: number;
    theta: number;
  };
  const getInitialPose = (): Pose => {
    if (theme === "red") {
      return {
        x: 1800,
        y: 500,
        theta: 0,
      };
    }

    return {
      x: setting.fieldSize.width - 1800,
      y: 500,
      theta: 0,
    };
  };

  const [pose, setPose] = useState<Pose>(getInitialPose);

  const handleReset = () => {
    setPose(getInitialPose());
  };

  return (
    <ChakraProvider value={defaultSystem}>
      <Box
        position="fixed"
        top={0}
        left={0}
        w="100%"
        h="100%"
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
            <Box p={2} borderBottom="1px solid" borderColor="gray.600">
              <HStack>
                <ChangeThemeButton />
                <RobotCoordinate
                  x={absolutePose.x} //実際の座標
                  y={absolutePose.y}
                  theta={absolutePose.theta}
                  connected={status === "CONNECTING" && espConnecting}
                />
              </HStack>
            </Box>

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
              <Box
                position="absolute"
                top={0}
                left={0}
                w={`${FIELD_W_PX}px`}
                h={`${FIELD_H_PX}px`}
                transformOrigin="top left"
                transform={`translate(${offsetX}px, ${offsetY}px) scale(${fieldScale})`}
              >
                <SetLocation />

                <Robot
                  x={absolutePose.x + (theme === "red" ? 200 : -200)}
                  y={absolutePose.y + 50}
                  theta={absolutePose.theta}
                  theme={theme}
                />
              </Box>
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
            overflowWrap="break-word"
          >
            {/* <Box flexShrink={0} m={0} p={0}>
              <RobotCoordinate
                x={absolutePose.x} //実際の座標
                y={absolutePose.y}
                theta={absolutePose.theta}
                connected={status === "CONNECTING" && espConnecting}
              />
            </Box>*/}

            <AllStopButton />
            <ResetButton onReset={handleReset} />
            <BeltoOutputSlider />
            <HStack flexWrap="wrap">
              <LaunchButton />

              {/* <MoveAndLaunchButton /> */}

              <LoadButton />
              <FlagButton />
              <BucketButton />
              <IntimidationButton />
            </HStack>
            {/* <Preset /> */}
            <ManualControl />
          </VStack>
        </HStack>
      </Box>
    </ChakraProvider>
  );
};

export default App;
