import { useState, useEffect, useCallback } from 'react';
import { MenuItem } from '@/types';

export function useMenu() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenu = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/menu');
      if (!res.ok) {
        throw new Error('Gagal mengambil data menu');
      }
      const data = await res.json();
      setMenu(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat menu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const addMenuItem = useCallback(async (item: Omit<MenuItem, 'id'>) => {
    try {
      const res = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal menambahkan menu');
      }
      await fetchMenu();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [fetchMenu]);

  const updateMenuItem = useCallback(async (id: number, item: Partial<MenuItem>) => {
    try {
      const res = await fetch('/api/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...item }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal mengubah menu');
      }
      await fetchMenu();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [fetchMenu]);

  const deleteMenuItem = useCallback(async (id: number) => {
    try {
      const res = await fetch('/api/menu', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal menghapus menu');
      }
      await fetchMenu();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [fetchMenu]);

  return {
    menu,
    loading,
    error,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    refreshMenu: fetchMenu
  };
}
export type UseMenuReturn = ReturnType<typeof useMenu>;
