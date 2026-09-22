import { Button } from "@chakra-ui/react";

type ResetButtonProps = {
  onReset: () => void;
};

const ResetButton = ({ onReset }: ResetButtonProps) => {
  return (
    <Button
      onClick={onReset}
      width="100%"
      background="#F8B400"
      rounded="3xl"
      _active={{
        transform: "translateY(3px)",
      }}
    >
      Reset Position
    </Button>
  );
};

export default ResetButton;
