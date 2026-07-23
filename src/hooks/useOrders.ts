import { useState, useEffect, useCallback } from 'react';
import { Order, OrderItem } from '@/types';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      setError(null);
      const res = await fetch('/api/orders');
      if (!res.ok) {
        throw new Error('Gagal mengambil data pesanan');
      }
      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat pesanan');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const placeOrder = useCallback(async (table: number, items: OrderItem[]): Promise<Order | null> => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, items }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal membuat pesanan');
      }
      const newOrder = await res.json() as Order;
      await fetchOrders(true);
      return newOrder;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [fetchOrders]);

  const updateOrderStatus = useCallback(async (id: number, status: Order['status']) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal memperbarui status pesanan');
      }
      await fetchOrders(true);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    placeOrder,
    updateOrderStatus,
    refreshOrders: (isSilent = true) => fetchOrders(isSilent)
  };
}

export type UseOrdersReturn = ReturnType<typeof useOrders>;
