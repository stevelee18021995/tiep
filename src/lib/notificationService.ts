const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  important: boolean;
  data?: any;
  timestamp: string;
  fullDate: string;
  created_at: string;
  read_at?: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: {
    data: Notification[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  unread_count: number;
}

export interface NotificationCountResponse {
  success: boolean;
  unread_count: number;
}

class NotificationService {
  private getToken(): string | null {
    // Lấy token từ cookie
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "token") {
        return decodeURIComponent(value);
      }
    }
    // Không có token trong cookie
    return null;
  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const token = this.getToken();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Get paginated notifications with filters
  async getNotifications(
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
    } = {}
  ): Promise<NotificationsResponse> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.set("page", params.page.toString());
    if (params.per_page)
      searchParams.set("per_page", params.per_page.toString());
    if (params.type && params.type !== "all")
      searchParams.set("type", params.type);
    if (params.search) searchParams.set("search", params.search);

    const queryString = searchParams.toString();
    const endpoint = `/notifications${queryString ? `?${queryString}` : ""}`;

    return this.request(endpoint);
  }

  // Get recent notifications for header dropdown
  async getRecentNotifications(): Promise<{
    success: boolean;
    data: Notification[];
    unread_count: number;
  }> {
    return this.request("/notifications/recent");
  }

  // Get unread count only
  async getUnreadCount(): Promise<NotificationCountResponse> {
    return this.request("/notifications/unread-count");
  }

  // Mark notification as read
  async markAsRead(id: number): Promise<{ success: boolean; message: string }> {
    return this.request(`/notifications/${id}/mark-as-read`, {
      method: "POST",
    });
  }

  // Mark notification as unread
  async markAsUnread(
    id: number
  ): Promise<{ success: boolean; message: string }> {
    return this.request(`/notifications/${id}/mark-as-unread`, {
      method: "POST",
    });
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<{ success: boolean; message: string }> {
    return this.request("/notifications/mark-all-as-read", {
      method: "POST",
    });
  }

  // Mark multiple notifications as read
  async markMultipleAsRead(
    notificationIds: number[]
  ): Promise<{ success: boolean; message: string }> {
    return this.request("/notifications/mark-multiple-as-read", {
      method: "POST",
      body: JSON.stringify({ notification_ids: notificationIds }),
    });
  }

  // Delete notification
  async deleteNotification(
    id: number
  ): Promise<{ success: boolean; message: string }> {
    return this.request(`/notifications/${id}`, {
      method: "DELETE",
    });
  }

  // Delete multiple notifications
  async deleteMultiple(
    notificationIds: number[]
  ): Promise<{ success: boolean; message: string }> {
    return this.request("/notifications/multiple", {
      method: "DELETE",
      body: JSON.stringify({ notification_ids: notificationIds }),
    });
  }
}

export const notificationService = new NotificationService();
