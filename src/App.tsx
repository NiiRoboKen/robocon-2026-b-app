import { useEffect, useMemo, useRef, useState } from "react";

import SetLocation from "./components/konva/konva.tsx";
import Robot from "./components/robot/Robot.tsx";
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

type ThemeType = "blue" | "red";

type Pose = {
  x: number;
  y: number;
  theta?: number;
};

// フィールドサイズ
const FIELD_W = 6000;
const FIELD_H = 10500;

// Blue側の原点
const ORIGIN_BLUE_X = 1800;
const ORIGIN_BLUE_Y = 500;

const App = () => {
  const { connect, disconnect } = useWebSocket();

  // 現在はBlue固定
  const [theme] = useState<ThemeType>("blue");

  // 初期ロボット位置
  const initialPose = useMemo<Pose>(() => {
    if (theme === "blue") {
      return {
        x: ORIGIN_BLUE_X,
        y: ORIGIN_BLUE_Y,
        theta: 0,
      };
    }

    return {
      x: FIELD_W - ORIGIN_BLUE_X,
      y: ORIGIN_BLUE_Y,
      theta: 0,
    };
  }, [theme]);

  // 現在のロボット位置
  const [pose] = useState<Pose>(initialPose);

  // フィールド表示領域
  const fieldRef = useRef<HTMLDivElement>(null);

  // 実際のフィールド表示サイズ
  const [fieldSize, setFieldSize] = useState({
    w: 1,
    h: 1,
  });

  // WebSocket接続
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // フィールドサイズを監視
  useEffect(() => {
    const el = fieldRef.current;

    if (!el) return;

    const updateSize = () => {
      const r = el.getBoundingClientRect();

      setFieldSize({
        w: r.width,
        h: r.height,
      });
    };

    // 初期サイズを取得
    updateSize();

    const ro = new ResizeObserver(() => {
      updateSize();
    });

    ro.observe(el);

    return () => {
      ro.disconnect();
    };
  }, []);

  // RobotCoordinateに表示する座標
  const displayCoord = useMemo(() => {
    const rawX = pose.x;
    const rawY = pose.y;

    if (theme === "blue") {
      return {
        x: rawX - ORIGIN_BLUE_X,
        y: rawY - ORIGIN_BLUE_Y,
      };
    }

    return {
      x: FIELD_W - rawX - ORIGIN_BLUE_X,
      y: rawY - ORIGIN_BLUE_Y,
    };
  }, [pose.x, pose.y, theme]);

  return (
    <ChakraProvider value={defaultSystem}>
      <Box
        w="100vw"
        h="100dvh"
        m={0}
        p={0}
        overflow="hidden"
        touchAction="none"
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
          {/* 左側：フィールド + 座標 */}
          <VStack
            w="60%"
            h="100%"
            minH={0}
            gap={0}
            m={0}
            p={0}
            align="stretch"
            overflow="hidden"
          >
            {/* フィールド */}
            <Box
              ref={fieldRef}
              flex="1"
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
                theme={theme}
                stageWidthPx={fieldSize.w}
                stageHeightPx={fieldSize.h}
                theta={pose.theta}
              />
            </Box>

            {/* 座標表示 */}
          </VStack>

          {/* 右側：操作パネル */}
          <VStack
            w="40%"
            h="100%"
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
            <LaunchButton />

            <BeltoOutputSlider />

            <Preset />
          </VStack>
        </HStack>
      </Box>
    </ChakraProvider>
  );
};

export default App;
