import { Box, Slider } from "@chakra-ui/react";
import { useController } from "../../hooks/useController";

export const BeltoOutputSlider = () => {
  const {shootPwm, setShootPwm} = useController();
  return (
    <Box pt="30px">
      <Slider.Root width="300px" 
        defaultValue={[shootPwm]} 
        min={0} max={2999} 
        onValueChangeEnd={(e) => setShootPwm(e.value[0])}
      >
        <Slider.Control>
          <Slider.Track>
            <Slider.Range />
          </Slider.Track>

          <Slider.Thumb index={0}>
            <Slider.ValueText
              position="absolute"
              bottom="100%"
              mb="8px"
              fontSize="sm"
              fontWeight="bold"
              whiteSpace="nowrap"
            />
          </Slider.Thumb>
        </Slider.Control>
      </Slider.Root>
    </Box>
  );
};
