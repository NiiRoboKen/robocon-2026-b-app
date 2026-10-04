import { Button } from "../Button/Button";
import { useEffect, useState, useRef } from "react";
import { useWebSocket } from "../../websocket";
import { useModeStore } from "../../hooks/useController";
import { getThemedX, getThemedDegree } from "../../controller";

const ORIGIN_X = 3900;
const ORIGIN_Y = 500;
const FIELD_WIDTH = 5700;

// 青のときの狙い位置: フィールド右端(5700)からさらに右へ1800mm
const TARGET_X = FIELD_WIDTH + 1800;
const TARGET_Y = 0;
const ANGLE_THRESHOLD = 2;
const ARRIVAL_THRESHOLD = 50;
const MAX_SHOOT_RANGE = 3500;

const RAIL_LENGTH = 0.88;
const GRAVITY = 9.8;

const calculateShootParams = (distanceMm: number) => {
  const distanceM = distanceMm / 1000;

  const requiredV0 = Math.sqrt(distanceM * GRAVITY);
  const requiredA = (requiredV0 * requiredV0) / (2 * RAIL_LENGTH);

  let pwm = Math.round((requiredA + 14.62) / 0.0198);
  pwm = Math.min(2999, Math.max(0, pwm));

  const actualA = 0.0168 * pwm - 14.62;
  const time = Number(Math.sqrt((2 * RAIL_LENGTH) / actualA).toFixed(3));

  return { pwm, time };
};

// ロボットの相対位置から、フィールド上の絶対座標・角度を算出する
// 赤陣地の基準X(1800)に移動量をそのまま足す。角度もロボット側の値をそのまま使う
const getCurrentPose = (
  status: { x: number; y: number; theta: number },
  mode: string,
) => {
  const baseOriginX = mode === "red" ? FIELD_WIDTH - ORIGIN_X : ORIGIN_X;
  return {
    x: baseOriginX + status.x,
    y: ORIGIN_Y + status.y,
    theta: status.theta,
  };
};

const IntimidationButton = () => {
  const { sendMessage, realtimeStatus, lastCommand } = useWebSocket();
  const { mode } = useModeStore();

  const [sequenceState, setSequenceState] = useState<"idle" | "approaching">(
    "idle",
  );
  const [approachPose, setApproachPose] = useState<{
    x: number;
    y: number;
    degree: number;
  } | null>(null);
  const isOurCommand = useRef(false);

  const handleClick = () => {
    if (sequenceState === "approaching") {
      sendMessage({ command: "emergency_stop" });
      setSequenceState("idle");
      setApproachPose(null);
      return;
    }

    const { x: currentX, y: currentY } = getCurrentPose(realtimeStatus, mode);

    const absoluteTargetX = getThemedX(TARGET_X, mode);

    const distToTarget = Math.hypot(
      absoluteTargetX - currentX,
      TARGET_Y - currentY,
    );

    let destX = currentX;
    let destY = currentY;

    if (distToTarget > MAX_SHOOT_RANGE) {
      const ratio = MAX_SHOOT_RANGE / distToTarget;
      destX = absoluteTargetX + (currentX - absoluteTargetX) * ratio;
      destY = TARGET_Y + (currentY - TARGET_Y) * ratio;
    }

    const dx = absoluteTargetX - destX;
    const dy = TARGET_Y - destY;
    const rawDegree = Math.atan2(-dx, dy) * (180 / Math.PI);
    const destDegree = getThemedDegree(rawDegree, mode);

    setApproachPose({ x: destX, y: destY, degree: destDegree });
    isOurCommand.current = true;
    setSequenceState("approaching");

    sendMessage({
      command: "navigate",
      x: destX,
      y: destY,
      degree: destDegree,
      theme: mode,
    });

    setTimeout(() => {
      isOurCommand.current = false;
    }, 200);
  };

  useEffect(() => {
    if (sequenceState !== "approaching") return;
    if (!lastCommand) return;
    if (isOurCommand.current) return;

    setSequenceState("idle");
    setApproachPose(null);
  }, [lastCommand, sequenceState]);

  useEffect(() => {
    if (sequenceState !== "approaching" || approachPose === null) return;

    const {
      x: currentX,
      y: currentY,
      theta: currentTheta,
    } = getCurrentPose(realtimeStatus, mode);

    const distToApproach = Math.hypot(
      approachPose.x - currentX,
      approachPose.y - currentY,
    );

    let diffDegree = currentTheta - approachPose.degree;
    diffDegree = ((diffDegree + 540) % 360) - 180;
    const isAngleMatched = Math.abs(diffDegree) < ANGLE_THRESHOLD;

    if (distToApproach < ARRIVAL_THRESHOLD && isAngleMatched) {
      const absoluteTargetX = getThemedX(TARGET_X, mode);

      const actualDistToTarget = Math.hypot(
        absoluteTargetX - currentX,
        TARGET_Y - currentY,
      );
      const { pwm, time } = calculateShootParams(actualDistToTarget);

      isOurCommand.current = true;

      sendMessage({
        command: "shoot",
        pwm,
        time,
      });

      setSequenceState("idle");
      setApproachPose(null);

      setTimeout(() => {
        isOurCommand.current = false;
      }, 200);
    }
  }, [realtimeStatus, sequenceState, mode, approachPose, sendMessage]);

  return (
    <Button
      onClick={handleClick}
      bg={sequenceState === "idle" ? "teal.400" : "red.500"}
    >
      {sequenceState === "idle" ? "おどし♬" : "キャンセル（旋回中）"}
    </Button>
  );
};

export default IntimidationButton;
