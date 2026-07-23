'use client';

import React, { useState } from 'react';
import { useTables } from '@/hooks/useTables';
import { useRouter } from 'next/navigation';
import { Settings2, Users, Flame, QrCode, ArrowRight } from 'lucide-react';
import { COLOR } from '@/lib/constants';
import AmbientBackground from '@/components/ui/AmbientBackground';
import GlassCard from '@/components/ui/GlassCard';

export default function LoginPage() {
  const router = useRouter();
  const { tables, loading: tablesLoading, updateTable } = useTables();
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [adminEmail, setAdminEmail] = useState('admin@rasanusantara.id');
  const [adminPassword, setAdminPassword] = useState('password123');
  const [adminError, setAdminError] = useState('');

  // Handle Customer Quick Login
  const handleCustomerLogin = async () => {
    if (!selectedTable) return;
    localStorage.setItem('resto_table', String(selectedTable));
    await updateTable(selectedTable, { status: 'terisi' });
    router.push('/customer');
  };

  // Handle Admin Quick Login
  const handleAdminQuickLogin = () => {
    localStorage.setItem('admin_authed', 'true');
    router.push('/admin');
  };

  // Handle Admin Traditional Login
  const handleAdminFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmail === 'admin@rasanusantara.id' && adminPassword === 'password123') {
      localStorage.setItem('admin_authed', 'true');
      router.push('/admin');
    } else {
      setAdminError('Email atau kata sandi salah!');
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10 selection:bg-orange-500 selection:text-white">
      <AmbientBackground />

      {/* Header Restoran */}
      <header className="text-center mb-8 animate-fade-in">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl glass-card mb-4">
          <Flame size={32} style={{ color: COLOR.chili }} className="animate-pulse" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-white">
          Warung <span style={{ color: COLOR.chili }}>Rasa Nusantara</span>
        </h1>
        <p className="text-sm mt-2 font-medium tracking-wide uppercase" style={{ color: COLOR.muted }}>
          Sistem Pemesanan Digital & Manajemen Restoran
        </p>
      </header>

      {/* Grid Login Options */}
      <section className="grid md:grid-cols-2 gap-8 w-full max-w-4xl px-2">
        
        {/* CARD 1: PELANGGAN (CUSTOMER) */}
        <GlassCard className="p-6 flex flex-col justify-between h-full border border-white/10 hover:border-white/20 transition-all duration-300">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${COLOR.matcha}22`, color: COLOR.matcha }}>
                <Users size={20} />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-white">Quick Login Pelanggan</h2>
                <p className="text-[11px]" style={{ color: COLOR.muted }}>Pilih meja dan pesan makanan langsung</p>
              </div>
            </div>
            
            <p className="text-xs mb-4 leading-relaxed" style={{ color: COLOR.cream }}>
              Silakan pilih nomor meja tempat Anda duduk saat ini untuk membuka menu makanan dan melakukan pemesanan digital.
            </p>

            {/* Grid Meja */}
            {tablesLoading ? (
              <div className="text-center py-6 text-xs text-white/50">
                Memuat meja Nusantara...
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 mb-6 max-h-40 overflow-y-auto pr-1">
                {tables.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTable(t.id)}
                    className={`py-2 rounded-xl text-[11px] font-mono font-bold transition-all duration-200 border ${
                      selectedTable === t.id
                        ? 'border-transparent text-slate-900 font-extrabold shadow-md scale-105'
                        : 'border-white/10 hover:border-white/30 text-white/70 hover:text-white'
                    }`}
                    style={{
                      background: selectedTable === t.id ? COLOR.matcha : 'rgba(255, 255, 255, 0.04)',
                      boxShadow: selectedTable === t.id ? `0 0 12px ${COLOR.matcha}55` : 'none',
                    }}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={!selectedTable}
            onClick={handleCustomerLogin}
            className="w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-95"
            style={{
              background: COLOR.matcha,
              color: '#150F1E',
              boxShadow: selectedTable ? `0 4px 15px ${COLOR.matcha}44` : 'none',
            }}
          >
            <QrCode size={15} />
            {selectedTable
              ? `Masuk sebagai Pelanggan (${tables.find((t) => t.id === selectedTable)?.name || 'Meja ' + selectedTable})`
              : 'Pilih Meja Dahulu'}
            <ArrowRight size={14} className="ml-1" />
          </button>
        </GlassCard>

        {/* CARD 2: ADMIN */}
        <GlassCard className="p-6 flex flex-col justify-between h-full border border-white/10 hover:border-white/20 transition-all duration-300">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${COLOR.turmeric}22`, color: COLOR.turmeric }}>
                <Settings2 size={20} />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-white">Login Admin</h2>
                <p className="text-[11px]" style={{ color: COLOR.muted }}>Kelola menu, pesanan, dan analytics</p>
              </div>
            </div>

            {/* Form Login Tradisional */}
            <form onSubmit={handleAdminFormLogin} className="flex flex-col gap-3 mb-4">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1" style={{ color: COLOR.muted }}>Email Admin</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="glass-input w-full rounded-xl px-3.5 py-2.5 text-xs"
                  placeholder="admin@rasanusantara.id"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider mb-1" style={{ color: COLOR.muted }}>Kata Sandi</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="glass-input w-full rounded-xl px-3.5 py-2.5 text-xs"
                  placeholder="••••••••"
                  required
                />
              </div>
              {adminError && (
                <p className="text-[11px] text-red-400 font-semibold">{adminError}</p>
              )}
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-xs font-semibold hover:brightness-105 active:scale-98 transition"
                style={{ background: 'rgba(255, 255, 255, 0.08)', color: COLOR.cream, border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Masuk Manual
              </button>
            </form>

            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <span className="relative bg-[#1E1630] px-2 text-[9px] uppercase tracking-widest" style={{ color: COLOR.muted }}>Atau Masuk Cepat</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdminQuickLogin}
            className="w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 hover:brightness-110 active:scale-95 text-slate-900"
            style={{
              background: COLOR.turmeric,
              boxShadow: `0 4px 15px ${COLOR.turmeric}44`,
            }}
          >
            <Settings2 size={15} />
            Quick Login Admin
            <ArrowRight size={14} className="ml-1" />
          </button>
        </GlassCard>

      </section>

      {/* Footer Info */}
      <footer className="mt-12 text-center text-xs" style={{ color: COLOR.muted }}>
        <p>© 2026 Warung Rasa Nusantara. All Rights Reserved.</p>
        <p className="mt-1 text-[10px] opacity-60">Menggunakan Next.js + React TypeScript + Tailwind CSS</p>
      </footer>
    </main>
  );
}
