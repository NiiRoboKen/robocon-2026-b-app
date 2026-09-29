import { Button } from "@chakra-ui/react";

const LoadButton = () => {
  return (
    <Button
      rounded="3xl"
      background="orange.400"
      _active={{
        transform: "translateY(3px)",
      }}
    >
      装填
    </Button>
  );
};

export default LoadButton;
