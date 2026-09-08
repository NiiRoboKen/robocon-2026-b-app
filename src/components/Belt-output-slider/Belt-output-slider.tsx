import { Box, Slider, Text} from "@chakra-ui/react";
import { useController } from "../../hooks/useController";

export const BeltoOutputSlider = () => {
  const {shootPwm, setShootPwm, shootTime, setShootTime} = useController();
  return (
    <Box pt="30px">
      <Text fontSize="sm" fontWeight="bold" mb={8}>
        発射出力 (9~2999)
        </Text>
      <Slider.Root width="300px" 
        defaultValue={[shootPwm]} 
        min={9} max={2999} step={10}
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

        <Text fontSize="sm" fontWeight="bold" mb={8}>
          発射時間 (s)
        </Text>
        <Slider.Root
          width="300px"
          defaultValue={[shootTime]}
          min={0.005}
          max={0.3}
          step={0.005}
          onValueChangeEnd={(e) => setShootTime(e.value[0])}
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
