import { useEffect } from "react";
import SetLocation from "./components/konva/konva.tsx";
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

const App = () => {
  const { connect, disconnect } = useWebSocket();

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return (
    <ChakraProvider value={defaultSystem}>
      <HStack w="100vw" h="100vh" gap={0} align="stretch" overflow="hidden">
        <Box w="60%" h="100%" flexShrink={0}>
          <SetLocation />
        </Box>

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
