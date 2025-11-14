// User types
export interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  balance: number;
  total_earned?: number;
  membership_tier?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

// Category types
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  active?: boolean;
}

// ObjectCategory types
export interface ObjectCategory {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string | null;
  properties: Record<string, unknown> | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface ObjectCategoryFormData {
  category_id: number;
  name: string;
  description?: string;
  properties?: Record<string, unknown>;
  active?: boolean;
}

// Product types
export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  promotion_code: string | null;
  promotion_start_date: string | null;
  promotion_end_date: string | null;
  image_url: string | null;
  gallery: string[] | null;
  stock_quantity: number;
  sku: string;
  is_active: boolean;
  is_featured: boolean;
  weight: number | null;
  specifications: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  // Computed properties
  current_price?: number;
  discount_percentage?: number;
  is_on_promotion?: boolean;
  is_in_stock?: boolean;
}

export interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  sale_price?: number;
  promotion_code?: string;
  promotion_start_date?: string;
  promotion_end_date?: string;
  image?: FileList; // File upload for main image
  gallery?: FileList; // File upload for gallery
  image_url?: string; // For existing image URL
  gallery_urls?: string[]; // For existing gallery URLs
  stock_quantity: number;
  sku?: string;
  is_active?: boolean;
  is_featured?: boolean;
  weight?: number;
  specifications?: Record<string, unknown>;
}

export interface ProductFilters {
  search?: string;
  is_active?: boolean;
  is_featured?: boolean;
  on_promotion?: boolean;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  per_page?: number;
  page?: number;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
  message?: string;
}
