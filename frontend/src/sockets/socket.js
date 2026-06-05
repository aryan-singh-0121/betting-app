import io from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  transports: ["websocket", "polling"],
});

// Connection events
socket.on("connect", () => {
  console.log("✅ Connected to server:", socket.id);
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from server");
});

socket.on("error", (error) => {
  console.error("Socket error:", error);
});

export default socket;
