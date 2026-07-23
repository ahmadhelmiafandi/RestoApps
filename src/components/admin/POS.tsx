import React, { useState, useMemo } from 'react';
import { Plus, Minus, Receipt } from 'lucide-react';
import { COLOR, rupiah } from '@/lib/constants';
import { MenuItem, Order, OrderItem, RestoTable } from '@/types';
import GlassCard from '../ui/GlassCard';

const CATEGORIES = ["Makanan Utama", "Camilan", "Minuman", "Dessert"] as const;

interface POSProps {
  menu: MenuItem[];
  tables: RestoTable[];
  placeOrder: (table: number, items: OrderItem[]) => Promise<Order | null>;
}

export default function POS({ menu, tables, placeOrder }: POSProps) {
  const [tableNum, setTableNum] = useState<number>(() => tables[0]?.id || 1);
  const [cart, setCart] = useState<{ id: number; qty: number }[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [placing, setPlacing] = useState(false);

  const categories = ['Semua', ...CATEGORIES];

  // Filter available items
  const filteredMenu = useMemo(() => {
    return menu.filter((item) => item.available && (activeCategory === 'Semua' || item.category === activeCategory));
  }, [menu, activeCategory]);

  // Cart list mapped to menu items
  const cartItems = useMemo(() => {
    return cart
      .map((c) => {
        const item = menu.find((x) => x.id === c.id);
        return item ? { ...item, qty: c.qty } : null;
      })
      .filter((item): item is MenuItem & { qty: number } => item !== null);
  }, [cart, menu]);

  // Cart total price
  const total = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [cartItems]);

  const handleAddToCart = (id: number) => {
    setConfirmedOrder(null); // Clear last order prompt
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

  const handleCreateOrder = async () => {
    if (cart.length === 0) return;
    setPlacing(true);

    const placed = await placeOrder(tableNum, cartItems);
    if (placed) {
      setConfirmedOrder(placed);
      setCart([]);
    }
    setPlacing(false);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-white">
      {/* Header POS */}
      <div>
        <h2 className="font-display text-3xl font-bold">POS / Kasir</h2>
        <p className="text-xs" style={{ color: COLOR.muted }}>
          Buat pesanan manual cepat untuk pelanggan walk-in
        </p>
      </div>

      {/* Main Grid: Menu dan Sidebar Cart */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Menu Items */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          {/* Tabs Kategori */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setActiveCategory(c)}
                className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition"
                style={{
                  background: activeCategory === c ? COLOR.cream : 'rgba(255,255,255,0.04)',
                  color: activeCategory === c ? '#1E1630' : COLOR.muted,
                  border: `1px solid ${activeCategory === c ? COLOR.cream : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Grid Item Menu */}
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredMenu.map((item) => (
              <GlassCard
                key={item.id}
                onClick={() => handleAddToCart(item.id)}
                className="p-4 flex items-center gap-3 border border-white/10 hover:border-white/20 active:scale-98 transition duration-200"
              >
                <span className="text-2xl filter drop-shadow">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{item.name}</p>
                  <p className="font-mono text-[10px] font-semibold mt-0.5" style={{ color: COLOR.matcha }}>
                    {rupiah(item.price)}
                  </p>
                </div>
                <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10 transition">
                  <Plus size={12} style={{ color: COLOR.chili }} />
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Kolom Kanan: Sidebar Pembayaran */}
        <GlassCard className="p-5 flex flex-col gap-5 border border-white/10 h-fit sticky top-6">
          {/* Pemilihan Meja */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-2.5" style={{ color: COLOR.muted }}>
              Pilih Nomor Meja
            </p>
            <div className="grid grid-cols-3 gap-1.5 max-h-24 overflow-y-auto pr-0.5">
              {tables.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTableNum(t.id)}
                  className="py-1.5 rounded-lg text-[11px] font-mono font-bold transition border truncate"
                  title={t.name}
                  style={{
                    background: tableNum === t.id ? COLOR.turmeric : 'rgba(255,255,255,0.04)',
                    color: tableNum === t.id ? '#1E1630' : COLOR.cream,
                    borderColor: tableNum === t.id ? COLOR.turmeric : 'rgba(255,255,255,0.08)',
                  }}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Rincian Cart POS */}
          <div className="border-t pt-4 flex flex-col gap-2.5 max-h-60 overflow-y-auto" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: COLOR.muted }}>
              Item Pesanan (Meja {tableNum})
            </p>
            {cartItems.length === 0 ? (
              <p className="text-xs text-center py-8" style={{ color: COLOR.muted }}>
                Belum ada makanan dipilih.
              </p>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2 text-xs">
                  <span className="flex-1 truncate text-white/90">{item.name}</span>
                  <button
                    type="button"
                    onClick={() => handleChangeQty(item.id, -1)}
                    className="w-5.5 h-5.5 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/15 text-white transition"
                  >
                    <Minus size={9} />
                  </button>
                  <span className="font-mono font-bold w-4 text-center">{item.qty}</span>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(item.id)}
                    className="w-5.5 h-5.5 rounded-full flex items-center justify-center transition text-slate-900 hover:brightness-110"
                    style={{ background: COLOR.chili }}
                  >
                    <Plus size={9} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Total Transaksi */}
          <div
            className="border-t pt-4 flex justify-between text-xs font-bold"
            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <span className="uppercase tracking-wider">Total</span>
            <span className="font-mono text-sm" style={{ color: COLOR.matcha }}>
              {rupiah(total)}
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            disabled={cart.length === 0 || placing}
            onClick={handleCreateOrder}
            className="w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 text-slate-900 transition hover:brightness-115 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: COLOR.chili,
              boxShadow: cart.length > 0 ? `0 4px 12px ${COLOR.chili}33` : 'none',
            }}
          >
            <Receipt size={14} />
            {placing ? 'Memproses...' : 'Buat Pesanan Manual'}
          </button>

          {/* Order Placed Success Alert */}
          {confirmedOrder && (
            <div
              className="text-center text-xs font-bold rounded-xl p-3 animate-scale-in"
              style={{ background: `${COLOR.selesai}18`, color: COLOR.selesai, border: `1px solid ${COLOR.selesai}33` }}
            >
              Pesanan {confirmedOrder.code} Meja {confirmedOrder.table} Berhasil Dibuat ✓
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
