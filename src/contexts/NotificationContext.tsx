import { useEffect, useState, useRef } from "react";
import type { ReactNode } from "react";
import { io as socketIOClient, Socket } from "socket.io-client";
import { apiService } from "../lib/api";
import { ensurePushPermissionAndSubscribe } from "../lib/push";
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
    // Ask for permission and subscribe this device to push notifications
    ensurePushPermissionAndSubscribe(user._id).catch((e: unknown) =>
      console.warn("[NotificationProvider] Push subscribe failed:", e)
    );
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
    const socket = socketIOClient(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
    });
    socketRef.current = socket;
    socket.on("connect", () => {
      console.log("[NotificationProvider] Socket connected:", socket.id);
      if (user?._id) socket.emit("join", user._id);
    });
    socket.on("disconnect", () => {
      console.log("[NotificationProvider] Socket disconnected");
    });
    socket.on("connect_error", (err) => {
      console.error("[NotificationProvider] Socket connect_error:", err?.message || err, "URL:", SOCKET_URL);
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

    // Also listen for new direct messages and surface them as notifications in Alerts
    // Only add if the current user is the recipient
    socket.on("newMessage", (msg: any) => {
      try {
        if (!msg || !msg.recipient || !msg.sender) return;
        const recipientId = typeof msg.recipient === 'object' ? msg.recipient._id : msg.recipient;
        if (recipientId?.toString() !== user._id?.toString()) return;
        const fromUser = msg.sender;
        const nameSource = fromUser.fullName || fromUser.username || 'Someone';
        const firstName = (nameSource as string).trim().split(' ')[0] || nameSource;
        const synthetic: Notification = {
          _id: msg._id,
          type: "message",
          from: {
            _id: fromUser._id,
            fullName: fromUser.fullName || fromUser.username || "",
            avatar: fromUser.avatar || "",
            username: fromUser.username || "",
          },
          text: `${firstName} sent you a message`,
          isRead: false,
          createdAt: msg.createdAt || new Date().toISOString(),
        } as Notification;
        setNotifications((prev) => [synthetic, ...prev]);
      } catch (e) {
        console.warn("[NotificationProvider] Failed to synthesize message notification", e);
      }
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
