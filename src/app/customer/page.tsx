'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMenu } from '@/hooks/useMenu';
import { useOrders } from '@/hooks/useOrders';
import { useTables } from '@/hooks/useTables';
import { ArrowLeft, Loader2, LogOut, ShoppingCart } from 'lucide-react';
import { COLOR, rupiah } from '@/lib/constants';

import AmbientBackground from '@/components/ui/AmbientBackground';
import BottomNav from '@/components/customer/BottomNav';
import ScanScreen from '@/components/customer/ScanScreen';
import MenuScreen from '@/components/customer/MenuScreen';
import CartScreen from '@/components/customer/CartScreen';
import ConfirmScreen from '@/components/customer/ConfirmScreen';
import StatusScreen from '@/components/customer/StatusScreen';
import GlassCard from '@/components/ui/GlassCard';

export default function CustomerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { menu, loading: menuLoading, error: menuError } = useMenu();
  const { orders, placeOrder, refreshOrders } = useOrders();
  const { updateTable } = useTables();

  // Local states
  const [table, setTable] = useState<number | null>(null);
  const [custView, setCustView] = useState<'scan' | 'menu' | 'cart' | 'confirm' | 'status'>('scan');
  const [cart, setCart] = useState<{ id: number; qty: number }[]>([]);
  const [lastOrderId, setLastOrderId] = useState<number | null>(null);
  const [checkingSession, setCheckingSession] = useState<boolean>(true);

  // Load session from localStorage OR from URL query parameter ?table=X (from QR scan)
  useEffect(() => {
    const tableFromUrl = searchParams.get('table');

    if (tableFromUrl && !isNaN(Number(tableFromUrl))) {
      // QR Code scan: auto set table from URL parameter
      const tableNum = Number(tableFromUrl);
      setTable(tableNum);
      localStorage.setItem('resto_table', String(tableNum));
      setCustView('menu');
      updateTable(tableNum, { status: 'terisi' });
    } else {
      // Fallback: check localStorage session
      const savedTable = localStorage.getItem('resto_table');
      const savedOrderId = localStorage.getItem('resto_last_order_id');

      if (savedTable) {
        setTable(Number(savedTable));
        setCustView('menu');
      }
      if (savedOrderId) {
        setLastOrderId(Number(savedOrderId));
      }
    }
    setCheckingSession(false);
  }, [searchParams, updateTable]);

  // Poll orders status periodically if we are tracking an active order
  useEffect(() => {
    if (custView !== 'status' || !lastOrderId) return;

    const interval = setInterval(() => {
      refreshOrders();
    }, 4000); // Poll status every 4 seconds

    return () => clearInterval(interval);
  }, [custView, lastOrderId, refreshOrders]);

  // Cart math
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const menuItem = menu.find((m) => m.id === item.id);
      return sum + (menuItem ? menuItem.price * item.qty : 0);
    }, 0);
  }, [cart, menu]);

  // Fetch the active order details
  const myOrder = useMemo(() => {
    return orders.find((o) => o.id === lastOrderId);
  }, [orders, lastOrderId]);

  // If there's an active order status check but myOrder is not found in database (yet/anymore)
  useEffect(() => {
    if (myOrder && custView === 'menu' && myOrder.status !== 'selesai') {
      // Auto take user back to status screen if they have an active order in progress
      setCustView('status');
    }
  }, [myOrder, custView]);

  // Actions
  const handleScanned = async (tableNum: number) => {
    setTable(tableNum);
    localStorage.setItem('resto_table', String(tableNum));
    setCustView('menu');
    await updateTable(tableNum, { status: 'terisi' });
  };

  const handleAddToCart = (id: number) => {
    setCart((curr) => {
      const existing = curr.find((x) => x.id === id);
      if (existing) {
        return curr.map((x) => (x.id === id ? { ...x, qty: x.qty + 1 } : x));
      }
      return [...curr, { id, qty: 1 }];
    });
  };

  const handleChangeQty = (id: number, delta: number) => {
    setCart((curr) => {
      return curr
        .map((x) => (x.id === id ? { ...x, qty: x.qty + delta } : x))
        .filter((x) => x.qty > 0);
    });
  };

  const handlePlaceOrder = async () => {
    if (!table || cart.length === 0) return;

    const mappedItems = cart
      .map((c) => {
        const item = menu.find((m) => m.id === c.id);
        return item ? { ...item, qty: c.qty } : null;
      })
      .filter((item): item is any => item !== null);

    const placed = await placeOrder(table, mappedItems);
    if (placed) {
      setLastOrderId(placed.id);
      localStorage.setItem('resto_last_order_id', String(placed.id));
      setCart([]);
      setCustView('confirm');
    }
  };

  const handleExitTable = async () => {
    if (table) {
      await updateTable(table, { status: 'kosong' });
    }
    localStorage.removeItem('resto_table');
    localStorage.removeItem('resto_last_order_id');
    setTable(null);
    setLastOrderId(null);
    setCart([]);
    setCustView('scan');
    router.push('/');
  };

  // Loading Screen
  if (checkingSession || (menuLoading && custView !== 'scan')) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <AmbientBackground />
        <div className="text-center flex flex-col items-center gap-3">
          <Loader2 size={36} className="animate-spin" style={{ color: COLOR.chili }} />
          <p className="text-xs font-semibold" style={{ color: COLOR.muted }}>Memuat menu Nusantara...</p>
        </div>
      </div>
    );
  }

  // Error Screen
  if (menuError && custView !== 'scan') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <AmbientBackground />
        <GlassCard className="p-6 text-center max-w-sm border border-white/10 flex flex-col gap-4">
          <p className="text-sm font-semibold text-red-400">Terjadi Kesalahan</p>
          <p className="text-xs" style={{ color: COLOR.cream }}>{menuError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="py-2.5 rounded-xl text-xs font-bold text-slate-900"
            style={{ background: COLOR.chili }}
          >
            Coba Lagi
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col justify-between">
      <AmbientBackground />
      
      {/* Container utama (Mobile Wrapper) */}
      <main className="max-w-md mx-auto w-full flex-1 flex flex-col px-4 pb-32 pt-6">
        
        {/* Tombol Kembali / Keluar Sesi Meja */}
        {table && custView === 'menu' && (
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={handleExitTable}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-card border border-white/10 text-xs font-medium text-red-400 active:scale-95 transition"
            >
              <LogOut size={13} />
              Ganti Meja
            </button>
            <p className="text-[10px] opacity-75 font-semibold text-white/60">Warung Rasa Nusantara</p>
          </div>
        )}

        {/* Dynamic Views */}
        {custView === 'scan' && (
          <ScanScreen onScanned={handleScanned} />
        )}

        {custView === 'menu' && table && (
          <MenuScreen
            table={table}
            menu={menu}
            cart={cart}
            onAdd={handleAddToCart}
            onChangeQty={handleChangeQty}
            cartCount={cartCount}
            cartTotal={cartTotal}
            onOpenCart={() => setCustView('cart')}
          />
        )}

        {custView === 'cart' && table && (
          <CartScreen
            menu={menu}
            cart={cart}
            onChangeQty={handleChangeQty}
            total={cartTotal}
            table={table}
            onBack={() => setCustView('menu')}
            onPlace={handlePlaceOrder}
          />
        )}

        {custView === 'confirm' && myOrder && (
          <ConfirmScreen
            order={myOrder}
            onSeeStatus={() => setCustView('status')}
          />
        )}

        {custView === 'status' && myOrder && (
          <StatusScreen
            order={myOrder}
            onBackToMenu={() => setCustView('menu')}
          />
        )}

      </main>

      {/* Sticky Bottom Navigation Bar */}
      {table && (custView === 'menu' || custView === 'cart' || custView === 'status') && (
        <BottomNav
          cartCount={cartCount}
          onMenu={() => setCustView('menu')}
          onCart={() => setCustView('cart')}
          onStatus={() => myOrder && setCustView('status')}
          hasOrder={!!myOrder}
          activeTab={custView === 'menu' ? 'menu' : custView === 'cart' ? 'cart' : 'status'}
        />
      )}
    </div>
  );
}
