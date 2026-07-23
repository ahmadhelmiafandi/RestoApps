import React from 'react';
import { QrCode, ScanLine } from 'lucide-react';
import { COLOR } from '@/lib/constants';
import GlassCard from '../ui/GlassCard';
import FakeQR from '../ui/FakeQR';

interface ScanScreenProps {
  onScanned: (tableNum: number) => void;
}

export default function ScanScreen({ onScanned }: ScanScreenProps) {
  const handleMockScan = () => {
    // Memilih meja acak 1-12 untuk simulasi scan
    const randomTable = Math.ceil(Math.random() * 12);
    onScanned(randomTable);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 text-center py-10 animate-fade-in">
      <div>
        <p className="uppercase tracking-[0.3em] text-[10px] font-bold mb-2" style={{ color: COLOR.matcha }}>
          Selamat Datang
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-tight text-white">
          Warung<br />
          <span style={{ color: COLOR.chili }}>Rasa Nusantara</span>
        </h1>
      </div>

      <GlassCard className="p-8 flex flex-col items-center gap-5 border border-white/10 w-full max-w-sm">
        <FakeQR seed="RESTO-TABLE" size={168} />
        <div className="flex items-center gap-2 text-xs" style={{ color: COLOR.muted }}>
          <ScanLine size={14} className="animate-pulse" />
          Arahkan kamera ke QR di meja Anda
        </div>
        <button
          type="button"
          onClick={handleMockScan}
          className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 text-slate-900 transition-all active:scale-95"
          style={{ background: COLOR.chili, boxShadow: `0 4px 12px ${COLOR.chili}33` }}
        >
          <QrCode size={17} /> Scan QR Meja (Simulasi)
        </button>
      </GlassCard>
      
      <p className="text-xs max-w-xs leading-relaxed" style={{ color: COLOR.muted }}>
        Belum bisa scan? Minta bantuan pelayan untuk nomor meja Anda atau pilih meja di halaman utama.
      </p>
    </div>
  );
}
