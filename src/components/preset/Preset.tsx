import { HStack, VStack } from "@chakra-ui/react";
import { Button } from "../Button/Button";

export const Preset = () => {
  return (
    <VStack w="100%" align="stretch" gap={2}>
      <HStack w="100%" gap={2}>
        <Button>ちょっと前進</Button>
        <Button>aiueo</Button>
      </HStack>

      <HStack w="100%" gap={2}>
        <Button>ちょっと後退</Button>
        <Button>aiueo</Button>
      </HStack>
    </VStack>
  );
};
