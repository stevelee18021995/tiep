const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

import {
  MembershipUpgradeRequestsResponse,
  MembershipUpgradeRequestStatistics,
  CreateMembershipUpgradeRequestData,
} from "@/types/membership";

class MembershipService {
  private getToken(): string | null {
    // Lấy token từ cookie
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "token") {
        return decodeURIComponent(value);
      }
    }
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

  // Get upgrade requests (all for admin, user's requests for member)
  async getUpgradeRequests(
    params: {
      page?: number;
      per_page?: number;
      status?: string;
    } = {}
  ): Promise<MembershipUpgradeRequestsResponse> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.set("page", params.page.toString());
    if (params.per_page)
      searchParams.set("per_page", params.per_page.toString());
    if (params.status) searchParams.set("status", params.status);

    const queryString = searchParams.toString();
    const endpoint = `/membership-upgrade-requests${
      queryString ? `?${queryString}` : ""
    }`;

    return this.request(endpoint);
  }

  // Create new upgrade request (member only)
  async createUpgradeRequest(
    data: CreateMembershipUpgradeRequestData
  ): Promise<{ success: boolean; message: string; data?: any }> {
    return this.request("/membership-upgrade-requests", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Approve upgrade request (admin only)
  async approveUpgradeRequest(
    requestId: number,
    adminNote?: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.request(`/membership-upgrade-requests/${requestId}/approve`, {
      method: "POST",
      body: JSON.stringify({ admin_note: adminNote }),
    });
  }

  // Reject upgrade request (admin only)
  async rejectUpgradeRequest(
    requestId: number,
    adminNote: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.request(`/membership-upgrade-requests/${requestId}/reject`, {
      method: "POST",
      body: JSON.stringify({ admin_note: adminNote }),
    });
  }

  // Get upgrade request statistics (admin only)
  async getStatistics(): Promise<{
    success: boolean;
    data: MembershipUpgradeRequestStatistics;
  }> {
    return this.request("/membership-upgrade-requests/statistics");
  }
}

export const membershipService = new MembershipService();
