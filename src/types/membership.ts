export interface MembershipUpgradeRequest {
  id: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  current_tier: string;
  requested_tier: string;
  reason?: string;
  status: "pending" | "approved" | "rejected";
  status_text: string;
  tier_name: string;
  admin_note?: string;
  reviewed_by?: {
    id: number;
    name: string;
  };
  reviewed_at?: string;
  created_at: string;
}

export interface MembershipUpgradeRequestsResponse {
  success: boolean;
  data: {
    data: MembershipUpgradeRequest[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface MembershipUpgradeRequestStatistics {
  pending_requests: number;
  approved_today: number;
  rejected_today: number;
  total_requests: number;
}

export interface CreateMembershipUpgradeRequestData {
  requested_tier: "silver" | "gold" | "platinum" | "diamond";
  reason?: string;
}
