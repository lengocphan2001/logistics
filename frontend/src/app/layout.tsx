import type { Metadata } from 'next';
import { Archivo, Be_Vietnam_Pro, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

/**
 * Archivo — headings, prices, quantities. An industrial grotesque with
 * tight apertures and sturdy figures, so numbers stay legible at small
 * sizes in a product grid.
 */
const archivo = Archivo({
  variable: '--font-display',
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  weight: ['500', '600', '700'],
  display: 'swap',
});

/**
 * Be Vietnam Pro — body and interface text. Drawn for Vietnamese, so the
 * diacritics stay clear at 13–15px instead of colliding with ascenders.
 */
const beVietnamPro = Be_Vietnam_Pro({
  variable: '--font-body',
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

/** Monospace is reserved for machine identifiers (bill of lading, tracking). */
const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Taman Logistics — Vận chuyển Trung - Việt',
  description:
    'Nền tảng logistics hiện đại: ký gửi, mua hộ, ví ¥ và theo dõi đơn hàng Trung Quốc về Việt Nam.',
  openGraph: {
    title: 'Taman Logistics',
    description: 'Vận chuyển quốc tế mượt mà & minh bạch',
    siteName: 'Taman Logistics',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${archivo.variable} ${beVietnamPro.variable} ${jetbrainsMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
