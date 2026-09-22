export type Commands =
  | ReceiveSuccess
  | Ping
  | ReceiveFailed
  | Pong
  | EmergencyStop
  | CurrentLocation
  | NavigateAbsolute
  | SetLocation
  | ToFSenser
  | Shoot;

export type ReceiveSuccess = {
  command: "receive_success";
};

export type Ping = {
  command: "ping";
};

export type ReceiveFailed = {
  command: "receive_failed";
  error_code: number;
};

export type Pong = {
  command: "pong";
};

export type EmergencyStop = {
  command: "emergency_stop";
};

export type CurrentLocation = {
  command: "current_location";
  x: number;
  y: number;
  degree: number;
};

export type SetLocation = {
  command: "set_location";
  x: number;
  y: number;
  degree: number;
};

export type ToFSenser = {
  command: "tof_senser";
  distance: number;
  ToFdegree: number;
};

export type NavigateAbsolute = {
  command: "navigate_absolute";
  x: number;
  y: number;
  degree: number; // 最終的な絶対目標角度（度）
};

export type Shoot = {
  command: "shoot";
  pwm: number;
  time: number;
};
