export interface Order {
  id: number;
  product_id?: number;
  product?: {
    id: number;
    name: string;
    price: number;
    image_url?: string;
    description?: string;
  };
  title: string;
  description?: string;
  total_value: number;
  profit_amount: number;
  status: "pending_distribution" | "completed" | "failed" | "rejected";
  status_text: string;
  assigned_user?: {
    id: number;
    name: string;
  };
  created_at: string;
  distributed_at?: string;
  completed_at?: string;
  failed_at?: string;
  rejected_at?: string;
  can_complete?: boolean;
  is_configured?: boolean; // Whether order was created from user setting distribution
  commission_rate?: number;
  membership_tier?: string;
}

export interface OrdersResponse {
  success: boolean;
  data: {
    data: Order[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface OrderStatistics {
  pending_orders: number;
  distributed_today: number;
  completed_today: number;
  total_profit_today: number;
}

export interface UserOrderStatistics {
  today_orders: number;
  daily_limit: number;
  remaining_today: number;
  total_pending: number; // Chờ phân phối
  total_completed: number; // Đã hoàn thành
  total_failed: number; // Thất bại
  total_rejected: number; // Từ chối
  total_all_orders: number; // Tất cả đơn hàng
  total_earnings: number;
  current_balance: number;
  membership_tier: string;
  commission_rate: number;
}

export interface CreateOrderData {
  product_id?: number;
  title: string;
  description?: string;
  total_value: number;
}
