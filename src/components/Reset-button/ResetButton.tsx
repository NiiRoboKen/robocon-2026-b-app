import { Button } from "@chakra-ui/react";

type ResetButtonProps = {
  onReset: () => void;
};

const ResetButton = ({ onReset }: ResetButtonProps) => {
  return (
    <Button onClick={onReset} width="100%" background="#F8B400" rounded="3xl">
      Reset Position
    </Button>
  );
};

export default ResetButton;
