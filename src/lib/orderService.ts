import {
  Order,
  OrdersResponse,
  OrderStatistics,
  UserOrderStatistics,
  CreateOrderData,
} from "@/types/order";
import { apiClient } from "./apiClient";

class OrderService {
  // Get orders (all for admin, user's orders for member)
  async getOrders(
    params: {
      page?: number;
      per_page?: number;
      status?: string;
      search?: string;
    } = {}
  ): Promise<OrdersResponse> {
    return apiClient.get<OrdersResponse>("/orders", params);
  }

  // Get specific order details
  async getOrder(id: number): Promise<{ success: boolean; data: Order }> {
    return apiClient.get<{ success: boolean; data: Order }>(`/orders/${id}`);
  }

  // Create new order (admin only)
  async createOrder(
    data: CreateOrderData
  ): Promise<{ success: boolean; data: Order; message: string }> {
    return apiClient.post<{ success: boolean; data: Order; message: string }>(
      "/orders",
      data
    );
  }

  // Complete an order (member only)
  async completeOrder(id: number): Promise<{
    success: boolean;
    message: string;
    profit_earned?: number;
    new_balance?: number;
  }> {
    return apiClient.post<{
      success: boolean;
      message: string;
      profit_earned?: number;
      new_balance?: number;
    }>(`/orders/${id}/complete`);
  }

  // Auto-complete all pending orders (admin only)
  async autoCompleteAllOrders(): Promise<{
    success: boolean;
    message: string;
    completed_count?: number;
    failed_count?: number;
    details?: any[];
  }> {
    return apiClient.post<{
      success: boolean;
      message: string;
      completed_count?: number;
      failed_count?: number;
      details?: any[];
    }>("/orders/auto-complete-all");
  }

  // Get order statistics (admin only)
  async getStatistics(): Promise<{ success: boolean; data: OrderStatistics }> {
    return apiClient.get<{ success: boolean; data: OrderStatistics }>(
      "/orders/statistics"
    );
  }

  // Get user's order statistics (member)
  async getUserStatistics(): Promise<{
    success: boolean;
    data: UserOrderStatistics;
  }> {
    return apiClient.get<{
      success: boolean;
      data: UserOrderStatistics;
    }>("/user/order-statistics");
  }

  // Create order from random product (member action)
  async createFromProduct(): Promise<{
    success: boolean;
    message: string;
    data?: {
      order: Order;
      remaining_today: number;
      new_balance?: number;
    };
    error_type?: string;
    debug?: any;
  }> {
    return apiClient.post<{
      success: boolean;
      message: string;
      data?: {
        order: Order;
        remaining_today: number;
        new_balance?: number;
      };
      error_type?: string;
      debug?: any;
    }>("/orders/create-from-product");
  }

  // Distribute a specific order (admin only)
  async distributeSpecificOrder(orderId: number): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    return apiClient.post<{
      success: boolean;
      message: string;
      data?: any;
    }>(`/orders/${orderId}/distribute`);
  }

  // Cancel a specific order (admin only)
  async cancelOrder(orderId: number): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    return apiClient.post<{
      success: boolean;
      message: string;
      data?: any;
    }>(`/orders/${orderId}/cancel`);
  }

  // Delete a specific order (admin only)
  async deleteOrder(orderId: number): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    return apiClient.delete<{
      success: boolean;
      message: string;
      data?: any;
    }>(`/orders/${orderId}`);
  }
}

export const orderService = new OrderService();
