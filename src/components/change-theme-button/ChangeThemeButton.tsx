import { useModeStore } from "../../hooks/useController.ts";
import "./ChangeThemeButton.css";
import { Button } from "@chakra-ui/react";

const ChangeThemeButton = () => {
  const { toggleMode } = useModeStore.getState();

  return (
    <Button
      className="change-theme-button"
      onClick={toggleMode}
      rounded="3xl"
      _active={{
        transform: "translateY(3px)",
      }}
    >
      Change Thema
    </Button>
  );
};

export default ChangeThemeButton;
