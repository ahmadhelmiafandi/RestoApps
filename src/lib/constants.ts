export const COLOR = {
  bg: '#150F1E',
  bg2: '#1E1630',
  chili: '#FF6B4A',
  turmeric: '#FFC93C',
  matcha: '#2DD4BF',
  cream: '#F6F1E7',
  muted: '#B8AFC2',
  glass: 'rgba(255,255,255,0.06)',
  glassBorder: 'rgba(255,255,255,0.14)',
  glassStrong: 'rgba(255,255,255,0.10)',
  masuk: '#5B9DFF',
  diproses: '#FFB238',
  selesai: '#34D399',
} as const;

export function rupiah(n: number): string {
  return 'Rp' + Math.round(n).toLocaleString('id-ID');
}
