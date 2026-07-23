'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTables } from '@/hooks/useTables';
import { useMenu } from '@/hooks/useMenu';
import { useOrders } from '@/hooks/useOrders';
import { COLOR } from '@/lib/constants';
import { playNewOrderAlert, playOrderChime } from '@/lib/audioNotification';
import { Order } from '@/types';

import {
  LayoutDashboard,
  Receipt,
  ClipboardList,
  ListChecks,
  LogOut,
  Settings2,
  Loader2,
  QrCode,
  Volume2,
  VolumeX,
  Bell,
  Volume2Icon
} from 'lucide-react';

import AmbientBackground from '@/components/ui/AmbientBackground';
import GlassCard from '@/components/ui/GlassCard';

// Sub-components
import Dashboard from '@/components/admin/Dashboard';
import POS from '@/components/admin/POS';
import MenuCRUD from '@/components/admin/MenuCRUD';
import OrdersManagement from '@/components/admin/OrdersManagement';
import TableCRUD from '@/components/admin/TableCRUD';

export default function AdminPage() {
  const router = useRouter();
  const { menu, addMenuItem, updateMenuItem, deleteMenuItem, loading: menuLoading } = useMenu();
  const { orders, placeOrder, updateOrderStatus, refreshOrders, loading: ordersLoading } = useOrders();
  const { tables, addTable, updateTable, deleteTable, loading: tablesLoading } = useTables();

  // Admin Auth and Views State
  const [authed, setAuthed] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<'dashboard' | 'pos' | 'menu' | 'orders' | 'tables'>('dashboard');

  // Audio & Notification State
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [newOrderBanner, setNewOrderBanner] = useState<{ table: number | string; code: string } | null>(null);

  const prevOrdersRef = useRef<Order[] | null>(null);

  // Check authentication session on mount
  useEffect(() => {
    const isAuthed = localStorage.getItem('admin_authed') === 'true';
    if (isAuthed) {
      setAuthed(true);
    }
    setCheckingAuth(false);
  }, []);

  // Detect new orders and trigger sound + voice notification
  useEffect(() => {
    if (!orders || orders.length === 0) return;

    if (prevOrdersRef.current !== null) {
      const prevIds = new Set(prevOrdersRef.current.map((o) => o.id));
      const newlyAdded = orders.filter((o) => !prevIds.has(o.id) && o.status === 'masuk');

      if (newlyAdded.length > 0) {
        const latestNewOrder = newlyAdded[0];
        setNewOrderBanner({ table: latestNewOrder.table, code: latestNewOrder.code });
        if (soundEnabled) {
          playNewOrderAlert(latestNewOrder.table, latestNewOrder.code);
        }
      }
    }

    prevOrdersRef.current = orders;
  }, [orders, soundEnabled]);

  // Periodic polling for new orders in background (every 5 seconds)
  useEffect(() => {
    if (!authed) return;

    const interval = setInterval(() => {
      refreshOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, [authed, refreshOrders]);

  const handleLogout = () => {
    localStorage.removeItem('admin_authed');
    setAuthed(false);
    router.push('/');
  };

  const handleLoginSuccess = () => {
    localStorage.setItem('admin_authed', 'true');
    setAuthed(true);
  };

  const handleTestSound = () => {
    playNewOrderAlert('01 (Tes)', 'A01');
  };

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { key: 'pos', label: 'POS / Kasir', Icon: Receipt },
    { key: 'menu', label: 'Kelola Menu', Icon: ClipboardList },
    { key: 'orders', label: 'Pesanan', Icon: ListChecks },
    { key: 'tables', label: 'Kelola Meja', Icon: QrCode },
  ] as const;

  // Render Loader during initial auth check
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <AmbientBackground />
        <Loader2 className="animate-spin" size={32} style={{ color: COLOR.turmeric }} />
      </div>
    );
  }

  // If not authenticated, render Fallback Login Form
  if (!authed) {
    return <AdminFallbackLogin onLogin={handleLoginSuccess} onBack={() => router.push('/')} />;
  }

  // Compute initial loading state (only show spinner on first load when no data exists yet)
  const isInitialLoading =
    (menuLoading && menu.length === 0) ||
    (ordersLoading && orders.length === 0) ||
    (tablesLoading && tables.length === 0);

  return (
    <div className="min-h-screen relative flex text-white font-sans">
      <AmbientBackground />

      {/* Floating Banner Toast for New Orders */}
      {newOrderBanner && (
        <div className="fixed top-5 right-5 z-50 animate-bounce">
          <GlassCard className="p-4 border-2 border-emerald-500/80 bg-[#1E1630] shadow-2xl flex items-center gap-4 text-white">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              🔔
            </div>
            <div>
              <h4 className="font-bold text-sm text-emerald-400">PESANAN BARU MASUK!</h4>
              <p className="text-xs text-white/80">Meja {newOrderBanner.table} · Kode Antrean {newOrderBanner.code}</p>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <button
                type="button"
                onClick={() => {
                  setActiveView('orders');
                  setNewOrderBanner(null);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 hover:brightness-110"
              >
                Lihat Pesanan
              </button>
              <button
                type="button"
                onClick={() => setNewOrderBanner(null)}
                className="p-1 text-white/50 hover:text-white"
              >
                ✕
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      <div className="flex-1 w-full flex flex-col md:flex-row px-4 sm:px-6 md:px-8 py-4 sm:py-6 gap-6 relative z-10">
        
        {/* MOBILE TOP HEADER BAR (Mobile Only) */}
        <header className="md:hidden flex items-center justify-between p-3.5 rounded-2xl glass-card border border-white/10 shadow-lg">
          <div>
            <h1 className="font-display text-lg font-bold tracking-tight" style={{ color: COLOR.turmeric }}>
              Rasa Nusantara
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-white/50">
              Panel Admin
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle Button */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 border transition ${
                soundEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-red-500/20 text-red-300 border-red-500/30'
              }`}
            >
              {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
              {soundEnabled ? 'Suara ON' : 'Mute'}
            </button>

            {/* Tes Suara Button */}
            <button
              type="button"
              onClick={handleTestSound}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-amber-400"
              title="Tes Suara Pesanan"
            >
              <Bell size={14} />
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
              title="Keluar Panel"
            >
              <LogOut size={14} />
            </button>
          </div>
        </header>

        {/* SIDEBAR NAVIGATION (Desktop Only) */}
        <aside className="w-60 shrink-0 hidden md:flex flex-col gap-3">
          {/* Logo Brand Restoran */}
          <GlassCard className="p-5 border border-white/10">
            <h1 className="font-display text-xl font-bold tracking-tight" style={{ color: COLOR.turmeric }}>
              Rasa Nusantara
            </h1>
            <p className="text-[11px] uppercase font-bold tracking-widest mt-1" style={{ color: COLOR.muted }}>
              Panel Admin
            </p>
          </GlassCard>

          {/* Audio Notification Settings */}
          <GlassCard className="p-3 border border-white/10 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold flex items-center gap-1.5" style={{ color: COLOR.cream }}>
                {soundEnabled ? <Volume2 size={14} className="text-emerald-400" /> : <VolumeX size={14} className="text-red-400" />}
                Suara Notifikasi
              </span>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-9 h-5 rounded-full transition-colors p-0.5 flex items-center ${
                  soundEnabled ? 'bg-emerald-500 justify-end' : 'bg-white/20 justify-start'
                }`}
                title="Toggle Suara Notifikasi"
              >
                <div className="w-4 h-4 rounded-full bg-white shadow" />
              </button>
            </div>
            
            <button
              type="button"
              onClick={handleTestSound}
              className="w-full py-1.5 px-2 rounded-xl text-[10px] font-bold bg-white/5 hover:bg-white/10 transition border border-white/10 flex items-center justify-center gap-1 text-slate-200"
            >
              <Bell size={11} className="text-amber-400" /> Tes Suara Pesanan
            </button>
          </GlassCard>

          {/* Nav Links */}
          <GlassCard className="p-2.5 flex flex-col gap-1 border border-white/10">
            {navItems.map((n) => (
              <button
                key={n.key}
                type="button"
                onClick={() => setActiveView(n.key)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200"
                style={{
                  background: activeView === n.key ? 'rgba(255,255,255,0.06)' : 'transparent',
                  color: activeView === n.key ? COLOR.cream : COLOR.muted,
                }}
              >
                <n.Icon size={16} style={{ color: activeView === n.key ? COLOR.turmeric : COLOR.muted }} />
                {n.label}
              </button>
            ))}
          </GlassCard>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all hover:bg-red-500/10 text-red-400 mt-auto border border-transparent hover:border-red-500/10 active:scale-95"
          >
            <LogOut size={16} /> Keluar Panel
          </button>
        </aside>

        {/* MOBILE NAVIGATION BAR (Sticky Bottom, Mobile Only) */}
        <nav className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-lg rounded-2xl glass-card p-1.5 flex justify-between items-center z-40 border border-white/15 shadow-2xl backdrop-blur-xl bg-[#171026]/90">
          {navItems.map((n) => {
            const isActive = activeView === n.key;
            return (
              <button
                key={n.key}
                type="button"
                onClick={() => setActiveView(n.key)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-white/10 font-bold' : 'opacity-70 hover:opacity-100'
                }`}
                style={{ color: isActive ? COLOR.turmeric : COLOR.muted }}
              >
                <n.Icon size={18} />
                <span className="text-[9px] tracking-tight">{n.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </nav>

        {/* MAIN PANEL CONTENT AREA */}
        <main className="flex-1 pb-28 md:pb-0" role="main">
          {isInitialLoading ? (
            <div className="h-96 flex items-center justify-center">
              <Loader2 size={32} className="animate-spin text-white/50" />
            </div>
          ) : (
            <>
              {activeView === 'dashboard' && <Dashboard orders={orders} menu={menu} />}
              {activeView === 'pos' && <POS menu={menu} tables={tables} placeOrder={placeOrder} />}
              {activeView === 'menu' && (
                <MenuCRUD
                  menu={menu}
                  addMenuItem={addMenuItem}
                  updateMenuItem={updateMenuItem}
                  deleteMenuItem={deleteMenuItem}
                />
              )}
              {activeView === 'orders' && (
                <OrdersManagement orders={orders} updateOrderStatus={updateOrderStatus} />
              )}
              {activeView === 'tables' && (
                <TableCRUD
                  tables={tables}
                  addTable={addTable}
                  updateTable={updateTable}
                  deleteTable={deleteTable}
                />
              )}
            </>
          )}
        </main>

      </div>
    </div>
  );
}


/* Fallback/Traditional Admin Login Panel */
interface FallbackProps {
  onLogin: () => void;
  onBack: () => void;
}
function AdminFallbackLogin({ onLogin, onBack }: FallbackProps) {
  const [email, setEmail] = useState('admin@rasanusantara.id');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@rasanusantara.id' && password === 'password123') {
      onLogin();
    } else {
      setError('Kredensial login admin tidak sesuai!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative z-10 text-white">
      <AmbientBackground />
      <GlassCard className="p-8 w-full max-w-sm border border-white/10 shadow-2xl flex flex-col gap-6">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3" style={{ background: `${COLOR.turmeric}22` }}>
            <Settings2 size={24} style={{ color: COLOR.turmeric, animationDuration: '4s' }} className="animate-spin" />
          </div>
          <h2 className="font-display text-2xl font-bold">Masuk Admin</h2>
          <p className="text-[11px] mt-1" style={{ color: COLOR.muted }}>
            Akses dashboard dapur, menu, dan laporan
          </p>
        </div>

        <form onSubmit={handleFormSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="glass-input rounded-xl px-4 py-3 text-xs w-full"
            placeholder="Email Admin"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="glass-input rounded-xl px-4 py-3 text-xs w-full"
            placeholder="Kata sandi"
            required
          />
          {error && <p className="text-[11px] font-semibold text-red-400">{error}</p>}
          
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl font-semibold text-xs mt-2 text-slate-900 transition hover:brightness-110 active:scale-95"
            style={{ background: COLOR.turmeric }}
          >
            Masuk ke Panel
          </button>
        </form>

        <button
          type="button"
          onClick={onBack}
          className="text-center text-xs font-semibold hover:text-white/80 transition"
          style={{ color: COLOR.muted }}
        >
          ← Kembali ke Halaman Utama
        </button>
      </GlassCard>
    </div>
  );
}
