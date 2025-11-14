"use client";

import { useState, useEffect, useCallback } from "react";
import { notificationService, Notification } from "@/lib/notificationService";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  // Fetch notifications with filters
  const fetchNotifications = useCallback(
    async (
      params: {
        page?: number;
        per_page?: number;
        type?:
          | "all"
          | "unread"
          | "read"
          | "info"
          | "success"
          | "warning"
          | "error";
        search?: string;
        append?: boolean;
      } = {}
    ) => {
      try {
        setLoading(true);
        setError(null);

        const response = await notificationService.getNotifications(params);

        if (params.append) {
          setNotifications((prev) => [...prev, ...response.data.data]);
        } else {
          setNotifications(response.data.data);
        }

        setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total,
        });

        setUnreadCount(response.unread_count);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch notifications"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Mark notification as read
  const markAsRead = useCallback(async (id: number) => {
    try {
      await notificationService.markAsRead(id);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, read: true, read_at: new Date().toISOString() }
            : n
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark notification as read"
      );
    }
  }, []);

  // Mark notification as unread
  const markAsUnread = useCallback(async (id: number) => {
    try {
      await notificationService.markAsUnread(id);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read: false, read_at: undefined } : n
        )
      );

      setUnreadCount((prev) => prev + 1);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark notification as unread"
      );
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          read: true,
          read_at: new Date().toISOString(),
        }))
      );

      setUnreadCount(0);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark all notifications as read"
      );
    }
  }, []);

  // Mark multiple as read
  const markMultipleAsRead = useCallback(
    async (ids: number[]) => {
      try {
        await notificationService.markMultipleAsRead(ids);

        setNotifications((prev) =>
          prev.map((n) =>
            ids.includes(n.id)
              ? { ...n, read: true, read_at: new Date().toISOString() }
              : n
          )
        );

        const unreadIds = notifications.filter(
          (n) => ids.includes(n.id) && !n.read
        );
        setUnreadCount((prev) => Math.max(0, prev - unreadIds.length));
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to mark notifications as read"
        );
      }
    },
    [notifications]
  );

  // Delete notification
  const deleteNotification = useCallback(
    async (id: number) => {
      try {
        await notificationService.deleteNotification(id);

        const notification = notifications.find((n) => n.id === id);

        setNotifications((prev) => prev.filter((n) => n.id !== id));

        if (notification && !notification.read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete notification"
        );
      }
    },
    [notifications]
  );

  // Delete multiple notifications
  const deleteMultiple = useCallback(
    async (ids: number[]) => {
      try {
        await notificationService.deleteMultiple(ids);

        const unreadIds = notifications.filter(
          (n) => ids.includes(n.id) && !n.read
        );

        setNotifications((prev) => prev.filter((n) => !ids.includes(n.id)));

        setUnreadCount((prev) => Math.max(0, prev - unreadIds.length));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete notifications"
        );
      }
    },
    [notifications]
  );

  // Refresh unread count
  const refreshUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.unread_count);
    } catch (err) {
      console.error("Failed to refresh unread count:", err);
      // Silently fail for count refresh
    }
  }, []);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    pagination,
    fetchNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    markMultipleAsRead,
    deleteNotification,
    deleteMultiple,
    refreshUnreadCount,
  };
}

// Hook for recent notifications (header dropdown)
export function useRecentNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchRecentNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await notificationService.getRecentNotifications();
      setNotifications(response.data);
      setUnreadCount(response.unread_count);
    } catch (err) {
      console.error("Failed to fetch recent notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: number) => {
    try {
      await notificationService.markAsRead(id);

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  }, []);

  useEffect(() => {
    fetchRecentNotifications();
  }, [fetchRecentNotifications]);

  return {
    notifications,
    loading,
    unreadCount,
    fetchRecentNotifications,
    markAsRead,
    markAllAsRead,
  };
}
