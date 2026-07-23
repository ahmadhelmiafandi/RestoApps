import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Warung Rasa Nusantara - Pemesanan Digital',
  description: 'Sistem Pemesanan Digital & Manajemen Restoran Rasa Nusantara',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning><body className="min-h-screen flex flex-col antialiased">{children}</body></html>
  );
}
