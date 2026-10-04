import { useModeStore } from "../../hooks/useController.ts";
import "./ChangeThemeButton.css";
import { Button } from "../Button/Button.tsx";

const ChangeThemeButton = () => {
  const { toggleMode } = useModeStore.getState();

  return (
    <Button className="change-theme-button" onClick={toggleMode}>
      Change Thema
    </Button>
  );
};

export default ChangeThemeButton;
