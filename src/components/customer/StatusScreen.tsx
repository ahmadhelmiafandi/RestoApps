import React from 'react';
import { ArrowLeft, Inbox, ChefHat, CheckCircle2 } from 'lucide-react';
import { COLOR, rupiah } from '@/lib/constants';
import { Order } from '@/types';
import GlassCard from '../ui/GlassCard';
import StatusPill from '../ui/StatusPill';

interface StatusScreenProps {
  order: Order;
  onBackToMenu: () => void;
}

export default function StatusScreen({ order, onBackToMenu }: StatusScreenProps) {
  const steps = [
    { key: 'masuk', label: 'Masuk', Icon: Inbox, color: COLOR.masuk },
    { key: 'diproses', label: 'Diproses', Icon: ChefHat, color: COLOR.diproses },
    { key: 'selesai', label: 'Selesai', Icon: CheckCircle2, color: COLOR.selesai },
  ] as const;

  const currentIdx = steps.findIndex((s) => s.key === order.status);

  return (
    <div className="animate-fade-in flex flex-col">
      {/* Header Halaman */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={onBackToMenu}
          className="w-9 h-9 rounded-full flex items-center justify-center glass-card border border-white/10 text-white hover:bg-white/10 active:scale-90 transition"
          aria-label="Back to menu"
        >
          <ArrowLeft size={16} />
        </button>
        <h2 className="font-display text-xl font-semibold text-white">Status Pesanan Anda</h2>
      </div>

      {/* Card Antrean */}
      <GlassCard className="p-6 mb-5 text-center relative border border-white/10 overflow-hidden">
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none opacity-15"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, transparent 0 10px, ${COLOR.bg} 10px 11px)`,
            height: 2,
          }}
        />
        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: COLOR.muted }}>
          Nomor Antrian
        </p>
        <h3 className="font-display text-6xl font-black my-2" style={{ color: COLOR.turmeric }}>
          {order.code}
        </h3>
        <div className="flex justify-center">
          <StatusPill status={order.status} />
        </div>
      </GlassCard>

      {/* Timeline Status Visualizer */}
      <GlassCard className="p-6 mb-5 border border-white/10 flex flex-col justify-center">
        <div className="flex items-center justify-between relative">
          {steps.map((s, i) => {
            const done = i <= currentIdx;
            const activeNow = i === currentIdx;
            
            return (
              <React.Fragment key={s.key}>
                {/* Step Circle */}
                <div className="flex flex-col items-center gap-2 flex-1 z-10">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-300 ${
                      activeNow ? 'animate-pulse-dot scale-105' : ''
                    }`}
                    style={{
                      background: done ? s.color : 'rgba(255, 255, 255, 0.04)',
                      color: done ? '#1E1630' : COLOR.muted,
                      borderColor: done ? s.color : 'rgba(255, 255, 255, 0.1)',
                      boxShadow: activeNow ? `0 0 15px ${s.color}66` : 'none',
                    }}
                  >
                    <s.Icon size={18} />
                  </div>
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: done ? COLOR.cream : COLOR.muted }}
                  >
                    {s.label}
                  </span>
                </div>

                {/* Connection Line */}
                {i < steps.length - 1 && (
                  <div
                    className="h-[2px] flex-1 -mt-5 transition-colors duration-300"
                    style={{
                      background: i < currentIdx ? steps[i].color : 'rgba(255, 255, 255, 0.08)',
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </GlassCard>

      {/* Rincian Pesanan Card */}
      <GlassCard className="p-5 flex flex-col gap-2.5 border border-white/10">
        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: COLOR.muted }}>
          Rincian Menu Dipesan · Meja {order.table}
        </p>
        
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
          <span>Total</span>
          <span className="font-mono" style={{ color: COLOR.matcha }}>
            {rupiah(order.total)}
          </span>
        </div>
      </GlassCard>

      {/* Petunjuk Refresh */}
      <p className="text-center text-[10px] mt-6" style={{ color: COLOR.muted }}>
        Status diperbarui otomatis dari sistem dapur restoran — tidak perlu memuat ulang halaman.
      </p>
    </div>
  );
}
