"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:8080"; // Ensure this is correct

export const useSocket = (roomId) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketInstance = io(SOCKET_SERVER_URL, {
      transports: ["websocket"],
      auth: { roomId } // Use WebSockets directly
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Connected to WebSocket server:", socketInstance.id);
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    return () => {
      socketInstance.disconnect();
      setSocket(null); // Cleanup
    };
  }, []);

  return socket;
};
