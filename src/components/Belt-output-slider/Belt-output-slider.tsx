import { Box, Slider, Text } from "@chakra-ui/react";
import { useController } from "../../hooks/useController";
import "./Belt-output-slider.css";

export const BeltoOutputSlider = () => {
  const { shootPwm, setShootPwm, shootTime, setShootTime } = useController();

  return (
    <Box className="shoot-setting">
      {/* 発射出力 */}
      <Text
        className="shoot-setting__label"
        fontSize="sm"
        fontWeight="bold"
        mb={6}
      >
        発射出力 (9~2999)
      </Text>

      <Slider.Root
        className="shoot-slider"
        width="260px"
        defaultValue={[shootPwm]}
        min={9}
        max={2999}
        step={10}
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

      {/* 発射時間 */}
      <Text
        className="shoot-setting__label shoot-setting__time"
        fontSize="sm"
        fontWeight="bold"
        mb={6}
      >
        発射時間 (s)
      </Text>

      <Slider.Root
        className="shoot-slider"
        width="260px"
        defaultValue={[shootTime]}
        min={0.005}
        max={0.4}
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
