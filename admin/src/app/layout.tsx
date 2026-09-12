import type { Metadata } from 'next';
import { Archivo, Be_Vietnam_Pro, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

/** Headings, money and counts. Sturdy figures at small sizes in dense tables. */
const archivo = Archivo({
  variable: '--font-display',
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  weight: ['500', '600', '700'],
  display: 'swap',
});

/** Body and interface text. Drawn for Vietnamese diacritics at 13–15px. */
const beVietnamPro = Be_Vietnam_Pro({
  variable: '--font-body',
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

/** Monospace is reserved for machine identifiers (bill of lading, codes). */
const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Logistics Admin',
  description: 'Logistics management admin dashboard',
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
