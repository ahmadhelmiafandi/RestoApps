import React, { useState, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { COLOR, rupiah } from '@/lib/constants';
import { Order } from '@/types';
import GlassCard from '../ui/GlassCard';
import StatusPill from '../ui/StatusPill';

interface OrdersManagementProps {
  orders: Order[];
  updateOrderStatus: (id: number, status: Order['status']) => Promise<boolean>;
}

export default function OrdersManagement({
  orders,
  updateOrderStatus,
}: OrdersManagementProps) {
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [activeFilter, setActiveFilter] = useState<'semua' | Order['status']>('semua');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Filter orders for the selected date, sorted newest first
  const dayOrders = useMemo(() => {
    return orders
      .filter((o) => o.date === date)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, date]);

  // Filter by tab status
  const filteredOrders = useMemo(() => {
    return activeFilter === 'semua' ? dayOrders : dayOrders.filter((o) => o.status === activeFilter);
  }, [dayOrders, activeFilter]);

  // Counts for tab badges
  const counts = useMemo(() => {
    return {
      semua: dayOrders.length,
      masuk: dayOrders.filter((o) => o.status === 'masuk').length,
      diproses: dayOrders.filter((o) => o.status === 'diproses').length,
      selesai: dayOrders.filter((o) => o.status === 'selesai').length,
    };
  }, [dayOrders]);

  const handleUpdateStatus = async (id: number, currentStatus: Order['status']) => {
    setUpdatingId(id);
    let nextStatus: Order['status'] = 'diproses';
    if (currentStatus === 'masuk') {
      nextStatus = 'diproses';
    } else if (currentStatus === 'diproses') {
      nextStatus = 'selesai';
    }
    await updateOrderStatus(id, nextStatus);
    setUpdatingId(null);
  };

  const tabs = [
    { key: 'semua', label: 'Semua', count: counts.semua },
    { key: 'masuk', label: 'Masuk', count: counts.masuk, color: COLOR.masuk },
    { key: 'diproses', label: 'Diproses', count: counts.diproses, color: COLOR.diproses },
    { key: 'selesai', label: 'Selesai', count: counts.selesai, color: COLOR.selesai },
  ] as const;

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-white">
      {/* Header Orders */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold">Pesanan Pelanggan</h2>
          <p className="text-xs" style={{ color: COLOR.muted }}>
            Kelola antrean dan perbarui status dapur
          </p>
        </div>
        <GlassCard className="px-4 py-2.5 flex items-center gap-2 border border-white/10">
          <Calendar size={15} style={{ color: COLOR.muted }} />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-transparent text-xs font-semibold outline-none text-white"
            style={{ colorScheme: 'dark' }}
          />
        </GlassCard>
      </div>

      {/* Tabs Filter Status */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveFilter(tab.key)}
            className="px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition border"
            style={{
              background: activeFilter === tab.key ? COLOR.cream : 'rgba(255, 255, 255, 0.04)',
              color: activeFilter === tab.key ? '#1E1630' : COLOR.muted,
              borderColor: activeFilter === tab.key ? COLOR.cream : 'rgba(255,255,255,0.08)',
            }}
          >
            {tab.label}
            <span
              className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md"
              style={{
                background: activeFilter === tab.key ? 'rgba(0,0,0,0.1)' : 'rgba(255, 255, 255, 0.1)',
                color: activeFilter === tab.key ? '#1E1630' : COLOR.cream,
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Grid Kartu Pesanan */}
      {filteredOrders.length === 0 ? (
        <GlassCard className="p-16 text-center border border-white/10">
          <p className="text-xs font-semibold" style={{ color: COLOR.muted }}>
            Tidak ada pesanan untuk filter ini pada tanggal yang dipilih.
          </p>
        </GlassCard>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const timeStr = new Date(order.createdAt).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <GlassCard key={order.id} className="p-5 flex flex-col gap-4 border border-white/10 hover:border-white/15 transition duration-300">
                {/* Header Card */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-2xl font-black" style={{ color: COLOR.turmeric }}>
                      {order.code}
                    </h3>
                    <p className="text-[10px] font-semibold mt-0.5" style={{ color: COLOR.muted }}>
                      Meja {order.table} · {timeStr}
                    </p>
                  </div>
                  <StatusPill status={order.status} />
                </div>

                {/* Items breakdown list */}
                <div
                  className="flex flex-col gap-1.5 border-t pt-3.5"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
                >
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs">
                      <span style={{ color: COLOR.muted }}>
                        {item.qty}x <span className="text-white/90 font-medium">{item.name}</span>
                      </span>
                      <span className="font-mono text-white/80">{rupiah(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>

                {/* Total and actions */}
                <div
                  className="flex justify-between text-xs font-bold pt-3 border-t mt-auto"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
                >
                  <span>Total Transaksi</span>
                  <span className="font-mono text-sm" style={{ color: COLOR.matcha }}>
                    {rupiah(order.total)}
                  </span>
                </div>

                {/* Action button */}
                {order.status !== 'selesai' && (
                  <button
                    type="button"
                    disabled={updatingId === order.id}
                    onClick={() => handleUpdateStatus(order.id, order.status)}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-900 transition mt-1 active:scale-95 disabled:opacity-40"
                    style={{
                      background: order.status === 'masuk' ? COLOR.diproses : COLOR.selesai,
                    }}
                  >
                    {updatingId === order.id
                      ? 'Memproses...'
                      : order.status === 'masuk'
                      ? 'Proses Pesanan →'
                      : 'Tandai Selesai ✓'}
                  </button>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
