import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { COLOR, rupiah } from '@/lib/constants';
import { Order } from '@/types';
import GlassCard from '../ui/GlassCard';
import FakeQR from '../ui/FakeQR';

interface ConfirmScreenProps {
  order: Order;
  onSeeStatus: () => void;
}

export default function ConfirmScreen({ order, onSeeStatus }: ConfirmScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-6 text-center gap-6 animate-fade-in">
      {/* Icon Success */}
      <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: `${COLOR.selesai}22` }}>
        <CheckCircle2 size={32} style={{ color: COLOR.selesai }} className="animate-bounce" />
      </div>

      {/* Info Utama Antrean */}
      <div>
        <p className="text-xs font-semibold" style={{ color: COLOR.muted }}>
          Pesanan Berhasil Dikirim
        </p>
        <h1 className="font-display text-5xl font-black mt-1" style={{ color: COLOR.turmeric }}>
          {order.code}
        </h1>
        <p className="text-xs mt-1" style={{ color: COLOR.muted }}>
          Nomor Antrian Anda · Meja {order.table}
        </p>
      </div>

      {/* Struk Pesanan Digital */}
      <GlassCard className="p-6 w-full max-w-sm flex flex-col items-center gap-4 border border-white/10 relative overflow-hidden">
        {/* QR Receipt */}
        <FakeQR seed={order.code} size={140} />
        
        <p className="text-[10px]" style={{ color: COLOR.muted }}>
          Tunjukkan kode/QR ini ke kasir saat melakukan pembayaran
        </p>
        
        <div className="w-full border-t border-dashed my-1" style={{ borderColor: COLOR.glassBorder }} />
        
        {/* Item breakdown */}
        <div className="w-full flex flex-col gap-2 text-left">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-xs text-white/90">
              <span style={{ color: COLOR.muted }}>
                {item.qty}x <span className="text-white font-medium">{item.name}</span>
              </span>
              <span className="font-mono text-xs">
                {rupiah(item.price * item.qty)}
              </span>
            </div>
          ))}
          
          <div
            className="flex justify-between text-sm font-bold pt-2 border-t mt-1"
            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <span>Total Transaksi</span>
            <span className="font-mono" style={{ color: COLOR.matcha }}>
              {rupiah(order.total)}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Button Track Status */}
      <button
        type="button"
        onClick={onSeeStatus}
        className="w-full max-w-sm py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 text-slate-900 transition-all hover:brightness-110 active:scale-95"
        style={{
          background: COLOR.turmeric,
          boxShadow: `0 4px 15px ${COLOR.turmeric}44`,
        }}
      >
        <Clock size={16} /> Pantau Proses Pesanan
      </button>
    </div>
  );
}
