import type { ReactNode } from "react";
import { Button as ChakraButton } from "@chakra-ui/react";

type Props = {
  children?: ReactNode;
  onClick?: () => void;
  className?: string;
  bg?: string;
};

export const Button = ({ children, onClick, className, bg }: Props) => {
  return (
    <ChakraButton
      color="white"
      fontSize="20px"
      px="24px"
      py="12px"
      minH="72px"
      _active={{
        transform: "translateY(3px)",
      }}
      onClick={onClick}
      className={className}
      bg={bg}
      rounded="3xl"
    >
      {children}
    </ChakraButton>
  );
};
