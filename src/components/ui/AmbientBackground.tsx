import React from 'react';
import { COLOR } from '@/lib/constants';

export default function AmbientBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden -z-10" style={{ background: COLOR.bg }}>
      {/* Blob 1 */}
      <div
        className="absolute rounded-full animate-float-blob"
        style={{
          width: 480,
          height: 480,
          background: COLOR.chili,
          filter: 'blur(120px)',
          opacity: 0.28,
          top: '-8%',
          left: '-10%',
        }}
      />
      {/* Blob 2 */}
      <div
        className="absolute rounded-full animate-float-blob-reverse"
        style={{
          width: 420,
          height: 420,
          background: COLOR.turmeric,
          filter: 'blur(130px)',
          opacity: 0.22,
          bottom: '-10%',
          right: '-8%',
        }}
      />
      {/* Blob 3 */}
      <div
        className="absolute rounded-full animate-float-blob"
        style={{
          width: 380,
          height: 380,
          background: COLOR.matcha,
          filter: 'blur(120px)',
          opacity: 0.18,
          top: '35%',
          right: '15%',
        }}
      />
    </div>
  );
}
