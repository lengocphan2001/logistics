import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
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
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-[family-name:var(--font-inter)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
