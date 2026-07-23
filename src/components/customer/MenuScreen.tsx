import React, { useState } from 'react';
import { Search, Star, Minus, Plus, ShoppingCart } from 'lucide-react';

import { COLOR, rupiah } from '@/lib/constants';
import { MenuItem } from '@/types';
import GlassCard from '../ui/GlassCard';

const CATEGORIES = ["Makanan Utama", "Camilan", "Minuman", "Dessert"] as const;

interface MenuScreenProps {
  table: number;
  menu: MenuItem[];
  cart: { id: number; qty: number }[];
  onAdd: (id: number) => void;
  onChangeQty: (id: number, delta: number) => void;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
}

export default function MenuScreen({
  table,
  menu,
  cart,
  onAdd,
  onChangeQty,
  cartCount,
  cartTotal,
  onOpenCart,
}: MenuScreenProps) {
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['Semua', ...CATEGORIES];

  // Filter menu based on search and category
  const filteredMenu = menu.filter((item) => {
    const matchesCategory = activeCategory === 'Semua' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return item.available && matchesCategory && matchesSearch;
  });

  return (
    <div className="animate-fade-in">
      {/* Header Info Meja */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLOR.muted }}>
            Nomor Meja Anda
          </p>
          <h2 className="font-display text-2xl font-semibold" style={{ color: COLOR.turmeric }}>
            Meja {table}
          </h2>
        </div>
      </div>

      {/* Bar Pencarian */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: COLOR.muted }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari masakan favoritmu..."
          className="glass-input w-full rounded-2xl pl-11 pr-4 py-3 text-xs"
        />
      </div>

      {/* Kategori Tab */}
      <nav className="flex gap-2 overflow-x-auto mb-6 pb-2 scrollbar-none" aria-label="Menu Categories">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className="px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200"
            style={{
              background: activeCategory === cat ? COLOR.cream : 'rgba(255, 255, 255, 0.04)',
              color: activeCategory === cat ? '#1E1630' : COLOR.muted,
              border: `1px solid ${activeCategory === cat ? COLOR.cream : 'rgba(255,255,255,0.08)'}`,
            }}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* Grid Menu Makanan */}
      <section className="grid grid-cols-2 gap-3 pb-24" aria-label="Food Menu Items">
        {filteredMenu.map((item) => {
          const cartItem = cart.find((c) => c.id === item.id);
          return (
            <GlassCard key={item.id} className="p-3.5 flex flex-col justify-between border border-white/10 hover:border-white/20 transition-all duration-300">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-3xl filter drop-shadow" role="img" aria-label={item.name}>
                    {item.emoji}
                  </span>
                  {item.popular && (
                    <span
                      className="flex items-center gap-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${COLOR.turmeric}22`, color: COLOR.turmeric }}
                    >
                      <Star size={9} fill={COLOR.turmeric} /> Populer
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-xs sm:text-sm leading-snug text-white mb-1">{item.name}</h3>
                <p className="text-[10px] leading-snug line-clamp-2 min-h-[32px] mb-2" style={{ color: COLOR.muted }}>
                  {item.desc}
                </p>
              </div>

              <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                <span className="font-mono text-xs font-semibold" style={{ color: COLOR.matcha }}>
                  {rupiah(item.price)}
                </span>
                
                {cartItem ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onChangeQty(item.id, -1)}
                      className="w-6 h-6 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition active:scale-90"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="text-xs font-mono font-bold w-3 text-center text-white">
                      {cartItem.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => onAdd(item.id)}
                      className="w-6 h-6 rounded-full flex items-center justify-center transition text-slate-900 hover:brightness-110 active:scale-90"
                      style={{ background: COLOR.chili }}
                      aria-label="Increase quantity"
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onAdd(item.id)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition text-slate-900 hover:scale-105 active:scale-95"
                    style={{ background: COLOR.chili, boxShadow: `0 2px 8px ${COLOR.chili}33` }}
                    aria-label="Add to cart"
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>
            </GlassCard>
          );
        })}

        {filteredMenu.length === 0 && (
          <div className="col-span-2 text-center py-16">
            <p className="text-xs font-medium" style={{ color: COLOR.muted }}>
              Menu tidak ditemukan. Coba ketikkan kata kunci lain.
            </p>
          </div>
        )}
      </section>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <button
          type="button"
          onClick={onOpenCart}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 max-w-md w-[calc(100%-2rem)] rounded-2xl px-5 py-4 flex items-center justify-between z-40 transition-all hover:brightness-115 active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${COLOR.chili}e6, ${COLOR.chili})`,
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: `0 8px 24px ${COLOR.chili}44`,
          }}
        >
          <span className="flex items-center gap-2 text-xs font-bold text-slate-950">
            <ShoppingCart size={15} />
            {cartCount} item dalam keranjang
          </span>
          <span className="font-mono text-xs font-black text-slate-950 bg-white/20 px-3 py-1 rounded-lg">
            {rupiah(cartTotal)}
          </span>
        </button>
      )}
    </div>
  );
}
