import { Button } from "@chakra-ui/react";

const IntimidationButton = () => {
  return (
    <Button
      rounded="3xl"
      bg="purple.900"
      color="white"
      _active={{
        transform: "translateY(3px)",
      }}
    >
      おどし♬
    </Button>
  );
};

export default IntimidationButton;
