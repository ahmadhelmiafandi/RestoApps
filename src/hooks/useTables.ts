import { useState, useEffect, useCallback } from 'react';
import { RestoTable } from '@/types';

export function useTables() {
  const [tables, setTables] = useState<RestoTable[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTables = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      setError(null);
      const res = await fetch('/api/tables');
      if (!res.ok) {
        throw new Error('Gagal mengambil data meja');
      }
      const data = await res.json();
      setTables(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat meja');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const addTable = useCallback(async (name: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal menambahkan meja');
      }
      await fetchTables(true);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [fetchTables]);

  const updateTable = useCallback(async (id: number, tableData: Partial<RestoTable>): Promise<boolean> => {
    try {
      const res = await fetch('/api/tables', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...tableData }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal mengubah meja');
      }
      await fetchTables(true);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [fetchTables]);

  const deleteTable = useCallback(async (id: number): Promise<boolean> => {
    try {
      const res = await fetch('/api/tables', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal menghapus meja');
      }
      await fetchTables(true);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [fetchTables]);

  return {
    tables,
    loading,
    error,
    addTable,
    updateTable,
    deleteTable,
    refreshTables: (isSilent = true) => fetchTables(isSilent),
  };
}

export type UseTablesReturn = ReturnType<typeof useTables>;
