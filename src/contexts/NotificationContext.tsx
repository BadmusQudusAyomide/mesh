import { useEffect, useState, useRef } from "react";
import type { ReactNode } from "react";
import { io as socketIOClient, Socket } from "socket.io-client";
import { apiService } from "../lib/api";
import { API_BASE_URL } from "../config";
import type { Notification } from "../types";
import { useAuth } from "./AuthContextHelpers";
import { NotificationContext } from "./NotificationContextHelpers";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || API_BASE_URL.replace(/\/api.*/, "");

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user || !user._id) return;
    let isMounted = true;
    const fetchNotifications = async () => {
      try {
        const res = await apiService.getNotifications();
        if (isMounted) setNotifications(res.notifications);
      } catch {
        // handle error
      }
    };
    fetchNotifications();
    // Clean up previous socket
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    // Socket.IO real-time notifications
    const socket = socketIOClient(SOCKET_URL);
    socketRef.current = socket;
    socket.on("connect", () => {
      console.log("[NotificationProvider] Socket connected:", socket.id);
    });
    socket.on("disconnect", () => {
      console.log("[NotificationProvider] Socket disconnected");
    });
    socket.emit("join", user._id);
    console.log("[NotificationProvider] Emitted join for user:", user._id);
    socket.on("notification", (notification: Notification) => {
      console.log(
        "[NotificationProvider] Received notification:",
        notification
      );
      setNotifications((prev) => [notification, ...prev]);
    });
    return () => {
      isMounted = false;
      socket.disconnect();
    };
  }, [user]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    // TODO: Optionally call backend to mark as read
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    // TODO: Optionally call backend to mark all as read
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
