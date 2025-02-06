"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:8080"; // Ensure this is correct

export const useSocket = (roomId) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Don't initialize socket until we have a valid roomId
    if (!roomId) return;

    // Initialize socket instance and handle socket connection
    const socketInstance = io(SOCKET_SERVER_URL, {
      withCredentials: true,
      transports: ["websocket"],
      auth: { roomId }  // Send roomId as part of the socket connection
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Connected to WebSocket server:", socketInstance.id);
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    // Cleanup on unmount or when roomId changes
    return () => {
      if (socketInstance.connected) {
        socketInstance.disconnect();
      }
      setSocket(null); // Cleanup state
    };
  }, [roomId]); // Re-run effect when roomId changes

  return socket;
};
