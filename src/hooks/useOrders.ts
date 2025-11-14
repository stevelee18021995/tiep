"use client";

import { useState, useCallback } from "react";
import { orderService } from "@/lib/orderService";
import {
  Order,
  OrderStatistics,
  UserOrderStatistics,
  CreateOrderData,
} from "@/types/order";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  const fetchOrders = useCallback(
    async (
      params: {
        page?: number;
        per_page?: number;
        status?: string;
        append?: boolean;
      } = {}
    ) => {
      try {
        setLoading(true);
        setError(null);

        const response = await orderService.getOrders(params);

        if (params.append) {
          setOrders((prev) => [...prev, ...response.data.data]);
        } else {
          setOrders(response.data.data);
        }

        setPagination({
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
          total: response.data.total,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createOrder = useCallback(
    async (data: CreateOrderData) => {
      try {
        setLoading(true);
        setError(null);

        const response = await orderService.createOrder(data);

        // Refresh orders list
        await fetchOrders();

        return response;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create order");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchOrders]
  );

  const completeOrder = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await orderService.completeOrder(id);

      // Update order in local state
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id
            ? {
                ...order,
                status: "completed",
                status_text: "Hoàn thành",
                can_complete: false,
              }
            : order
        )
      );

      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete order");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    orders,
    loading,
    error,
    pagination,
    fetchOrders,
    createOrder,
    completeOrder,
  };
}

export function useOrderStatistics() {
  const [statistics, setStatistics] = useState<OrderStatistics | null>(null);
  const [userStatistics, setUserStatistics] =
    useState<UserOrderStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await orderService.getStatistics();
      setStatistics(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch statistics"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await orderService.getUserStatistics();
      setUserStatistics(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch user statistics"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    statistics,
    userStatistics,
    loading,
    error,
    fetchStatistics,
    fetchUserStatistics,
  };
}
