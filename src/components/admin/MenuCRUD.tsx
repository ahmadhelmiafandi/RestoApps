import React, { useState } from 'react';
import { Plus, Pencil, Trash2, X, Star } from 'lucide-react';
import { COLOR, rupiah } from '@/lib/constants';
import { MenuItem } from '@/types';
import GlassCard from '../ui/GlassCard';

const CATEGORIES = ["Makanan Utama", "Camilan", "Minuman", "Dessert"] as const;

interface MenuCRUDProps {
  menu: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<boolean>;
  updateMenuItem: (id: number, item: Partial<MenuItem>) => Promise<boolean>;
  deleteMenuItem: (id: number) => Promise<boolean>;
}

interface MenuItemFormState {
  name: string;
  category: string;
  price: string;
  desc: string;
  emoji: string;
  available: boolean;
  popular: boolean;
}

const emptyForm: MenuItemFormState = {
  name: '',
  category: CATEGORIES[0],
  price: '',
  desc: '',
  emoji: '🍛',
  available: true,
  popular: false,
};

export default function MenuCRUD({
  menu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
}: MenuCRUDProps) {
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [form, setForm] = useState<MenuItemFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const handleOpenNew = () => {
    setForm(emptyForm);
    setEditingId('new');
  };

  const handleOpenEdit = (item: MenuItem) => {
    setForm({
      name: item.name,
      category: item.category,
      price: String(item.price),
      desc: item.desc,
      emoji: item.emoji,
      available: item.available,
      popular: item.popular,
    });
    setEditingId(item.id);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    setSaving(true);

    const priceNum = Number(form.price);
    const itemData = {
      name: form.name,
      category: form.category,
      price: priceNum,
      desc: form.desc,
      emoji: form.emoji,
      available: form.available,
      popular: form.popular,
    };

    let success = false;
    if (editingId === 'new') {
      success = await addMenuItem(itemData);
    } else if (typeof editingId === 'number') {
      success = await updateMenuItem(editingId, itemData);
    }

    if (success) {
      setEditingId(null);
      setForm(emptyForm);
    }
    setSaving(false);
  };

  const handleToggleAvailable = async (item: MenuItem) => {
    await updateMenuItem(item.id, { available: !item.available });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus menu ini?')) {
      await deleteMenuItem(id);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-white">
      {/* Header CRUD */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold">Kelola Menu</h2>
          <p className="text-xs" style={{ color: COLOR.muted }}>
            Tambah, ubah, atau hapus menu restoran Anda
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenNew}
          className="px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 text-slate-900 transition hover:brightness-110 active:scale-95"
          style={{ background: COLOR.matcha }}
        >
          <Plus size={16} /> Tambah Menu Baru
        </button>
      </div>

      {/* Tabel Menu */}
      <GlassCard className="p-2 border border-white/10 overflow-x-auto">
        <table className="w-full text-xs min-w-[640px] text-left">
          <thead>
            <tr className="border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
              <th className="px-5 py-3.5 uppercase tracking-widest text-[11px] font-bold text-white/50">Item</th>
              <th className="px-5 py-3.5 uppercase tracking-widest text-[11px] font-bold text-white/50">Kategori</th>
              <th className="px-5 py-3.5 uppercase tracking-widest text-[11px] font-bold text-white/50">Harga</th>
              <th className="px-5 py-3.5 uppercase tracking-widest text-[11px] font-bold text-white/50">Status</th>
              <th className="px-5 py-3.5 uppercase tracking-widest text-[11px] font-bold text-white/50 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {menu.map((item) => (
              <tr key={item.id} className="hover:bg-white/2 transition-colors duration-150">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl filter drop-shadow">{item.emoji}</span>
                    <div>
                      <p className="font-bold text-white text-sm">
                        {item.name}
                        {item.popular && (
                          <Star size={11} fill={COLOR.turmeric} style={{ color: COLOR.turmeric }} className="inline ml-1.5 mb-0.5" />
                        )}
                      </p>
                      <p className="text-[10px] mt-0.5 line-clamp-1 max-w-xs" style={{ color: COLOR.muted }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 font-medium text-white/80">{item.category}</td>
                <td className="px-5 py-4 font-mono text-white/95 font-semibold">{rupiah(item.price)}</td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => handleToggleAvailable(item)}
                    className="text-[10px] font-bold px-3 py-1.5 rounded-full transition"
                    style={{
                      background: item.available ? `${COLOR.selesai}22` : `${COLOR.chili}22`,
                      color: item.available ? COLOR.selesai : COLOR.chili,
                      border: `1px solid ${item.available ? COLOR.selesai : COLOR.chili}33`
                    }}
                  >
                    {item.available ? 'Tersedia' : 'Habis'}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/15 border border-white/10 text-white transition duration-150"
                      aria-label="Edit item"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition duration-150"
                      aria-label="Delete item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      {/* Modal Overlay CRUD */}
      {editingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <GlassCard className="p-6 w-full max-w-md border border-white/15 bg-[#1E1630]" style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.6)' }}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl font-bold text-white">
                {editingId === 'new' ? 'Tambah Menu Baru' : 'Ubah Menu Kuliner'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="text-white/60 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <div className="w-16">
                  <label className="block text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: COLOR.muted }}>Emoji</label>
                  <input
                    type="text"
                    value={form.emoji}
                    onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                    className="glass-input rounded-xl px-3 py-3 text-sm w-full text-center"
                    placeholder="🍔"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: COLOR.muted }}>Nama Menu</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="glass-input rounded-xl px-4 py-3 text-xs w-full"
                    placeholder="Nasi Uduk Spesial"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: COLOR.muted }}>Deskripsi Menu</label>
                <textarea
                  value={form.desc}
                  onChange={(e) => setForm({ ...form, desc: e.target.value })}
                  className="glass-input rounded-xl px-4 py-3 text-xs w-full resize-none"
                  placeholder="Deskripsi singkat mengenai rasa dan isi porsi"
                  rows={2}
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: COLOR.muted }}>Kategori</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="glass-input rounded-xl px-4 py-3 text-xs w-full bg-[#1E1630]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-[#1E1630]">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-32">
                  <label className="block text-[9px] uppercase tracking-wider font-bold mb-1" style={{ color: COLOR.muted }}>Harga (Rupiah)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="glass-input rounded-xl px-4 py-3 text-xs w-full font-mono font-bold"
                    placeholder="35000"
                    required
                  />
                </div>
              </div>

              {/* Checkbox Options */}
              <div className="flex gap-5 text-xs font-semibold mt-1" style={{ color: COLOR.cream }}>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.available}
                    onChange={(e) => setForm({ ...form, available: e.target.checked })}
                    className="rounded border-white/20 bg-white/5 text-teal-500 focus:ring-0 focus:ring-offset-0"
                  />
                  Tersedia di Dapur
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.popular}
                    onChange={(e) => setForm({ ...form, popular: e.target.checked })}
                    className="rounded border-white/20 bg-white/5 text-amber-500 focus:ring-0 focus:ring-offset-0"
                  />
                  Menu Terlaris (Populer)
                </label>
              </div>

              {/* Submit Modal Button */}
              <button
                type="button"
                disabled={!form.name || !form.price || saving}
                onClick={handleSave}
                className="w-full py-3.5 rounded-2xl font-bold text-xs text-slate-900 mt-2 hover:brightness-110 active:scale-98 transition disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: COLOR.matcha,
                  boxShadow: `0 4px 12px ${COLOR.matcha}33`,
                }}
              >
                {saving ? 'Menyimpan...' : 'Simpan Data Menu'}
              </button>
            </div>

          </GlassCard>
        </div>
      )}
    </div>
  );
}
