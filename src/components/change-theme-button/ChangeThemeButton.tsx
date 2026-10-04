import { useModeStore } from "../../hooks/useController.ts";
import { Button } from "@chakra-ui/react";

const ChangeThemeButton = () => {
  const { toggleMode } = useModeStore.getState();

  return (
    <Button onClick={toggleMode} color="white" bg="#00ff7f" rounded="3xl">
      Change Thema
    </Button>
  );
};

export default ChangeThemeButton;
