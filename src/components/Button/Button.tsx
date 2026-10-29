import type { ReactNode } from "react";
import { Button as ChakraButton } from "@chakra-ui/react";
import "./Button.css";

type Props = {
  children?: ReactNode;
  onClick?: () => void;
  className?: string;
  bg?: string;
  background?: string;
};

export const Button = ({
  children,
  onClick,
  className,
  bg,
  background,
}: Props) => {
  return (
    <ChakraButton
      color="white"
      fontSize="24px"
      fontWeight="black"
      px="24px"
      py="12px"
      minH="72px"
      w="100%"
      _active={{
        transform: "translateY(5px) scale(0.95)",
      }}
      onClick={onClick}
      className={`pachinko-button ${className || ""}`}
      background={background || bg}
      rounded="3xl"
    >
      {children}
    </ChakraButton>
  );
};
