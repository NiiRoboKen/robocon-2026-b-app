import { create } from "zustand";
import ReconnectingWebSocket from "reconnecting-websocket";
import type { Status, ToFStatus } from "./controller";
import { setting } from "./controller";
import type { Commands } from "./commandsType";

type ExtendedCommands =
  | Commands
  | { command: "connection_success" }
  | { command: "connection_failed" };

interface WebSocketState {
  realtimeStatus: Status;
  espConnecting: boolean;
  status: "ERROR" | "CONNECTING" | "CLOSE";
  socket: ReconnectingWebSocket | null;
  tofStatus: ToFStatus;
  sendMessage: (data: Commands) => void;
  connect: () => void;
  disconnect: () => void;
}

export const useWebSocket = create<WebSocketState>((set, get) => ({
  socket: null,
  espConnecting: false,
  status: "CLOSE",
  realtimeStatus: {
    x: setting.defaultRobotPosition.x / setting.fieldSize.width,
    y: setting.defaultRobotPosition.y / setting.fieldSize.height,
    theta: setting.defaultRobotPosition.theta,
  },
  tofStatus: {
    distance: 0,
    degree: 0,
  },

  connect: () => {
    if (get().socket) return;

    const socket = new ReconnectingWebSocket("ws://192.168.151.188:3000/");

    socket.onopen = () => {
      console.log("WebSocket connected");
      set({ socket, status: "CONNECTING" });
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      set({ socket: null, status: "CLOSE" });
    };

    socket.onerror = () => {
      set({ status: "ERROR" });
    };

    socket.onmessage = (event) => {
      try {
        const receivedData = JSON.parse(event.data) as ExtendedCommands;

        switch (receivedData.command) {
          case "current_location":
            set({
              realtimeStatus: {
                x: receivedData.x / setting.fieldSize.width,
                y: receivedData.y / setting.fieldSize.height,
                theta: receivedData.degree,
              },
            });
            break;

          case "tof_senser":
            set({
              tofStatus: {
                distance: receivedData.distance,
                degree: receivedData.ToFdegree,
              },
            });
            break;

          case "connection_failed":
            set({ espConnecting: false });
            break;

          case "connection_success":
            set({ espConnecting: true });
            break;

          default:
            break;
        }
      } catch (error) {
        console.error("Invalid JSON received:", event.data, error);
      }
    };
  },

  disconnect: () => {
    const socket = get().socket;
    if (socket) {
      socket.close();
      set({ socket: null, status: "CLOSE" });
    }
  },

  sendMessage: (data: Commands) => {
    const socket = get().socket;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    } else {
      console.warn("WebSocket not connected, cannot send:", data);
    }
  },
}));
