import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet, TrendingUp, Receipt, Users, Calendar } from 'lucide-react';
import { COLOR, rupiah } from '@/lib/constants';
import { MenuItem, Order } from '@/types';
import GlassCard from '../ui/GlassCard';

interface DashboardProps {
  orders: Order[];
  menu: MenuItem[];
}

export default function Dashboard({ orders, menu }: DashboardProps) {
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [mounted, setMounted] = useState(false);

  // Client-side mount check to avoid Recharts SSR hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter orders for the selected date
  const dayOrders = useMemo(() => {
    return orders.filter((o) => o.date === date);
  }, [orders, date]);

  // Analytics Calculations
  const totalOrders = dayOrders.length;
  const completedOrders = dayOrders.filter((o) => o.status === 'selesai');
  const grossRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const netRevenue = grossRevenue * 0.68; // Simulation of net margin after COGS (HPP) ~32%
  const avgOrder = totalOrders ? Math.round(dayOrders.reduce((sum, o) => sum + o.total, 0) / totalOrders) : 0;

  // Compute hourly sales
  const hourlyData = useMemo(() => {
    const buckets: Record<string, number> = {};
    
    // Seed basic working hours
    for (let h = 9; h <= 22; h++) {
      buckets[`${String(h).padStart(2, '0')}:00`] = 0;
    }

    dayOrders.forEach((o) => {
      try {
        const hour = new Date(o.createdAt).getHours();
        if (hour >= 9 && hour <= 22) {
          const label = `${String(hour).padStart(2, '0')}:00`;
          buckets[label] = (buckets[label] || 0) + o.total;
        }
      } catch (e) {
        // Fallback for date parse errors
      }
    });

    return Object.entries(buckets)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([jam, pendapatan]) => ({ jam, pendapatan }));
  }, [dayOrders]);

  // Compute top selling items
  const topItems = useMemo(() => {
    const counts: Record<string, number> = {};
    dayOrders.forEach((o) => {
      o.items.forEach((it) => {
        counts[it.name] = (counts[it.name] || 0) + it.qty;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [dayOrders]);

  const kpis = [
    { label: 'Pendapatan Bersih', value: rupiah(netRevenue), Icon: Wallet, color: COLOR.matcha, sub: 'Estimasi margin 68%' },
    { label: 'Pendapatan Kotor', value: rupiah(grossRevenue), Icon: TrendingUp, color: COLOR.turmeric, sub: 'Dari pesanan selesai' },
    { label: 'Total Pesanan', value: totalOrders, Icon: Receipt, color: COLOR.masuk, sub: `${completedOrders.length} selesai` },
    { label: 'Rata-rata / Pesanan', value: rupiah(avgOrder), Icon: Users, color: COLOR.chili, sub: 'Semua status pesanan' },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-white">
      {/* Header Dashboard */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold">Dashboard</h2>
          <p className="text-xs" style={{ color: COLOR.muted }}>Ringkasan performa penjualan harian</p>
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

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <GlassCard key={k.label} className="p-5 border border-white/10">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${k.color}22` }}>
              <k.Icon size={17} style={{ color: k.color }} />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: COLOR.muted }}>{k.label}</p>
            <p className="font-display text-xl sm:text-2xl font-semibold mt-1 text-white">{k.value}</p>
            <p className="text-[11px] mt-1" style={{ color: COLOR.muted }}>{k.sub}</p>
          </GlassCard>
        ))}
      </div>

      {/* Graphs Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Hourly Revenue Chart */}
        <GlassCard className="p-5 lg:col-span-2 border border-white/10">
          <h3 className="text-sm font-semibold mb-4">Grafik Pendapatan per Jam</h3>
          {dayOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60">
              <p className="text-xs font-semibold" style={{ color: COLOR.muted }}>
                Belum ada transaksi pada tanggal ini.
              </p>
            </div>
          ) : (
            <div style={{ width: '100%', height: 240 }}>
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                    <XAxis dataKey="jam" stroke={COLOR.muted} fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke={COLOR.muted}
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#1E1630',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 12,
                        fontSize: 11,
                        color: '#F6F1E7',
                      }}
                      formatter={(v: any) => [rupiah(Number(v) || 0), 'Pendapatan']}
                      cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                    />
                    <Bar dataKey="pendapatan" fill={COLOR.turmeric} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
        </GlassCard>

        {/* Top 5 Menu Items */}
        <GlassCard className="p-5 border border-white/10">
          <h3 className="text-sm font-semibold mb-4">5 Menu Terlaris</h3>
          {topItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48">
              <p className="text-xs font-semibold" style={{ color: COLOR.muted }}>
                Belum ada data penjualan.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {topItems.map(([name, qty], idx) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold w-4 text-white/50">{idx + 1}</span>
                  <span className="flex-1 text-xs text-white/95 font-medium">{name}</span>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded" style={{ background: `${COLOR.matcha}22`, color: COLOR.matcha }}>
                    {qty}x porsi
                  </span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
