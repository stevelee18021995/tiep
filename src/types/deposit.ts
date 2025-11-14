export interface DepositRequest {
  id: number;
  user_id: number;
  type: "deposit" | "withdraw";
  amount: number;
  payment_method: "bank_transfer" | "momo" | "zalopay" | "vietqr";
  status: "pending" | "approved" | "rejected";
  note?: string;
  admin_note?: string;
  payment_proof?: string;
  bank_name?: string;
  account_holder_name?: string;
  account_number?: string;
  approved_by?: number;
  approved_at?: string;
  payment_info?: any;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
  };
  approved_by_user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateDepositRequest {
  type: "deposit" | "withdraw";
  amount: number;
  payment_method?: "bank_transfer" | "momo" | "zalopay" | "vietqr";
  note?: string;
  payment_proof?: string;
  bank_name?: string;
  account_holder_name?: string;
  account_number?: string;
  payment_info?: any;
}

export interface DepositRequestStatistics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  deposits: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    total_amount: number;
    today_requests: number;
    today_amount: number;
  };
  withdraws: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    total_amount: number;
    today_requests: number;
    today_amount: number;
  };
  today_requests: number;
  total_approved_amount: number;
}

export interface PaginatedDepositRequests {
  data: DepositRequest[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}
