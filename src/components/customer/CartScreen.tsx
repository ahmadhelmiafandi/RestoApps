import React from 'react';
import { ArrowLeft, Minus, Plus } from 'lucide-react';
import { COLOR, rupiah } from '@/lib/constants';
import { MenuItem } from '@/types';
import GlassCard from '../ui/GlassCard';

interface CartScreenProps {
  menu: MenuItem[];
  cart: { id: number; qty: number }[];
  onChangeQty: (id: number, delta: number) => void;
  total: number;
  table: number;
  onBack: () => void;
  onPlace: () => void;
}

export default function CartScreen({
  menu,
  cart,
  onChangeQty,
  total,
  table,
  onBack,
  onPlace,
}: CartScreenProps) {
  // Map cart items with their menu metadata
  const cartItems = cart
    .map((c) => {
      const item = menu.find((m) => m.id === c.id);
      return item ? { ...item, qty: c.qty } : null;
    })
    .filter((item): item is MenuItem & { qty: number } => item !== null);

  return (
    <div className="animate-fade-in flex flex-col min-h-[calc(100vh-180px)]">
      {/* Header Halaman */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center glass-card border border-white/10 text-white hover:bg-white/10 active:scale-90 transition"
          aria-label="Back to menu"
        >
          <ArrowLeft size={16} />
        </button>
        <h2 className="font-display text-xl font-semibold text-white">Keranjang Belanja</h2>
      </div>

      {/* Daftar Item Keranjang */}
      <div className="flex-1">
        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xs font-semibold" style={{ color: COLOR.muted }}>
              Keranjang belanja Anda masih kosong.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 mb-6">
            {cartItems.map((item) => (
              <GlassCard
                key={item.id}
                className="p-4 flex items-center gap-4 border border-white/10"
              >
                <span className="text-2xl filter drop-shadow" role="img" aria-label={item.name}>
                  {item.emoji}
                </span>
                <div className="flex-1">
                  <h3 className="text-xs sm:text-sm font-bold text-white">{item.name}</h3>
                  <p className="font-mono text-xs font-semibold mt-0.5" style={{ color: COLOR.matcha }}>
                    {rupiah(item.price)}
                  </p>
                </div>
                
                {/* Quantity Editor */}
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => onChangeQty(item.id, -1)}
                    className="w-7 h-7 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white border border-white/10 active:scale-90 transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-xs font-mono font-bold w-4 text-center text-white">
                    {item.qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => onChangeQty(item.id, 1)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition text-slate-900 hover:brightness-110 active:scale-90"
                    style={{ background: COLOR.chili }}
                    aria-label="Increase quantity"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {/* Ringkasan Biaya */}
      {cartItems.length > 0 && (
        <div className="mt-auto">
          <GlassCard className="p-5 mb-5 border border-white/10">
            <div className="flex justify-between text-xs mb-2.5" style={{ color: COLOR.muted }}>
              <span>Nomor Meja Anda</span>
              <span className="font-bold text-white">Meja {table}</span>
            </div>
            <div
              className="flex justify-between text-sm font-bold pt-3 border-t"
              style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <span>Total Pembayaran</span>
              <span className="font-mono text-base" style={{ color: COLOR.turmeric }}>
                {rupiah(total)}
              </span>
            </div>
          </GlassCard>

          {/* Place Order Button */}
          <button
            type="button"
            onClick={onPlace}
            className="w-full py-4 rounded-2xl font-bold text-sm text-slate-900 transition-all duration-300 hover:brightness-110 hover:shadow-lg active:scale-95"
            style={{
              background: COLOR.chili,
              boxShadow: `0 4px 15px ${COLOR.chili}44`,
            }}
          >
            Kirim Pesanan ke Dapur
          </button>
        </div>
      )}
    </div>
  );
}
