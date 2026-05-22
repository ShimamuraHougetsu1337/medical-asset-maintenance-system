"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import { toast } from "sonner";
import { ServiceRequest } from "@/types";

interface SocketContextType {
  subscribe: <T>(event: string, callback: (data: T) => void) => () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
  userRole?: string;
}

export const SocketProvider = ({ children, userRole }: SocketProviderProps) => {
  const listenersRef = useRef<{ [event: string]: ((data: never) => void)[] }>({});

  const subscribe = <T,>(event: string, callback: (data: T) => void) => {
    if (!listenersRef.current[event]) {
      listenersRef.current[event] = [];
    }
    listenersRef.current[event].push(callback as unknown as (data: never) => void);
    return () => {
      listenersRef.current[event] = listenersRef.current[event].filter(
        (cb) => cb !== (callback as unknown as (data: never) => void)
      );
    };
  };

  useEffect(() => {
    if (!userRole) {
      return;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws/notifications";
    let socket: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | undefined;

    function connect() {
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log("WebSocket connected to notifications");
      };

      socket.onmessage = (event) => {
        try {
          const request = JSON.parse(event.data) as ServiceRequest;
          
          if (localStorage.getItem("alert_asset_failure") !== "false") {
            const assetName = request.assetName || request.asset?.name || "Thiết bị";
            const desc = request.description?.toLowerCase() || "";
            const isMaintenance = desc.includes("bảo trì") || desc.includes("định kỳ");

            if (request.status === "PENDING") {
              toast.info(
                isMaintenance 
                  ? `Yêu cầu bảo trì mới: ${assetName}` 
                  : `Yêu cầu sửa chữa mới: ${assetName}`,
                {
                  description: request.description,
                  duration: 6000,
                }
              );
            } else if (request.status === "ASSIGNED") {
              toast.info(
                isMaintenance
                  ? `Cập nhật: Thiết bị ${assetName} bắt đầu bảo trì`
                  : `Cập nhật: Thiết bị ${assetName} bắt đầu sửa chữa`,
                {
                  description: `Kỹ sư phụ trách: ${request.assignedEngineerUsername || "Chưa rõ"}`,
                  duration: 6000,
                }
              );
            } else if (request.status === "COMPLETED") {
              toast.success(
                isMaintenance
                  ? `Cập nhật: Thiết bị ${assetName} đã hoàn thành bảo trì!`
                  : `Cập nhật: Thiết bị ${assetName} đã sửa xong!`,
                {
                  description: `Đã khôi phục trạng thái hoạt động tốt.`,
                  duration: 6000,
                }
              );
            }
          }

          // Trigger listeners
          const eventListeners = listenersRef.current["new-repair-request"];
          if (eventListeners) {
            eventListeners.forEach((cb) => cb(request as never));
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message", err);
        }
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed, reconnecting in 5s...");
        reconnectTimeout = setTimeout(connect, 5000);
      };

      socket.onerror = (err) => {
        console.error("WebSocket error:", err);
        socket?.close();
      };
    }

    connect();

    return () => {
      if (socket) {
        socket.onclose = null;
        socket.close();
      }
      clearTimeout(reconnectTimeout);
    };
  }, [userRole]);

  return (
    <SocketContext.Provider value={{ subscribe }}>
      {children}
    </SocketContext.Provider>
  );
};
