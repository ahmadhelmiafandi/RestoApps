import React from 'react';
import { Inbox, ChefHat, CheckCircle2 } from 'lucide-react';
import { COLOR } from '@/lib/constants';
import { Order } from '@/types';

interface StatusPillProps {
  status: Order['status'];
}

export default function StatusPill({ status }: StatusPillProps) {
  const map = {
    masuk: { label: 'Masuk', color: COLOR.masuk, Icon: Inbox },
    diproses: { label: 'Diproses', color: COLOR.diproses, Icon: ChefHat },
    selesai: { label: 'Selesai', color: COLOR.selesai, Icon: CheckCircle2 },
  };

  const config = map[status];
  if (!config) return null;
  const { label, color, Icon } = config;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
      style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}
    >
      <Icon size={13} /> {label}
    </span>
  );
}
