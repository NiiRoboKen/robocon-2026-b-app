import { Button } from "@chakra-ui/react";

const BucketButton = () => {
  return (
    <Button
      rounded="3xl"
      background="orange.400"
      _active={{
        transform: "translateY(3px)",
      }}
    >
      バケツ
    </Button>
  );
};

export default BucketButton;
