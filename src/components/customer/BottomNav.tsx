import React from 'react';
import { UtensilsCrossed, ShoppingCart, Clock } from 'lucide-react';
import { COLOR } from '@/lib/constants';

interface BottomNavProps {
  cartCount: number;
  onMenu: () => void;
  onCart: () => void;
  onStatus: () => void;
  hasOrder: boolean;
  activeTab: 'menu' | 'cart' | 'status';
}

export default function BottomNav({
  cartCount,
  onMenu,
  onCart,
  onStatus,
  hasOrder,
  activeTab,
}: BottomNavProps) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 max-w-md w-[calc(100%-2rem)] rounded-2xl glass-card px-2 py-2 flex justify-around z-40 border border-white/10 shadow-xl">
      {/* Tab Menu */}
      <button
        type="button"
        onClick={onMenu}
        className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all duration-200"
        style={{
          color: activeTab === 'menu' ? COLOR.chili : COLOR.muted,
          background: activeTab === 'menu' ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
        }}
      >
        <UtensilsCrossed size={18} />
        <span className="text-[9px] font-bold uppercase tracking-wider">Menu</span>
      </button>

      {/* Tab Keranjang */}
      <button
        type="button"
        onClick={onCart}
        className="relative flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all duration-200"
        style={{
          color: activeTab === 'cart' ? COLOR.chili : COLOR.muted,
          background: activeTab === 'cart' ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
        }}
      >
        <ShoppingCart size={18} />
        {cartCount > 0 && (
          <span
            className="absolute top-1 right-3 w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold text-slate-900 animate-scale-in"
            style={{ background: COLOR.chili }}
          >
            {cartCount}
          </span>
        )}
        <span className="text-[9px] font-bold uppercase tracking-wider">Keranjang</span>
      </button>

      {/* Tab Status */}
      <button
        type="button"
        onClick={onStatus}
        disabled={!hasOrder}
        className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          color: activeTab === 'status' ? COLOR.chili : COLOR.muted,
          background: activeTab === 'status' ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
        }}
      >
        <Clock size={18} />
        <span className="text-[9px] font-bold uppercase tracking-wider">Status</span>
      </button>
    </div>
  );
}
