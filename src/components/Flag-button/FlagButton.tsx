import { Button } from "@chakra-ui/react";

const FlagButton = () => {
  return (
    <Button
      rounded="3xl"
      background="orange.400"
      _active={{
        transform: "translateY(3px)",
      }}
    >
      旗
    </Button>
  );
};

export default FlagButton;
