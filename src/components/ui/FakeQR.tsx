import React, { useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { COLOR } from '@/lib/constants';

interface FakeQRProps {
  seed?: string;
  size?: number;
}

export default function FakeQR({ seed = 'MEJA-01', size = 148 }: FakeQRProps) {
  const qrValue = useMemo(() => {
    if (!seed) return 'https://rasanusantara.id';
    if (seed.startsWith('http://') || seed.startsWith('https://')) {
      return seed;
    }
    if (seed.startsWith('/')) {
      if (typeof window !== 'undefined') {
        return `${window.location.origin}${seed}`;
      }
      return `http://localhost:3000${seed}`;
    }
    return seed;
  }, [seed]);

  return (
    <div
      className="rounded-2xl p-3 flex items-center justify-center bg-white border border-white/10 shadow-sm"
      style={{ width: size, height: size }}
    >
      <QRCodeSVG
        value={qrValue}
        size={size - 24}
        bgColor="#FFFFFF"
        fgColor="#1E1630"
        level="M"
        includeMargin={false}
      />
    </div>
  );
}

