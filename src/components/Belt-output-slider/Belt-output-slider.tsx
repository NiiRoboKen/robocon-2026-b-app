import { Box, Slider } from "@chakra-ui/react";

export const BeltoOutputSlider = () => {
  return (
    <Box pt="30px">
      <Slider.Root width="300px" defaultValue={[40]} min={0} max={100}>
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
