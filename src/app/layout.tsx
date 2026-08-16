import type { Metadata } from 'next';
import localFont from 'next/font/local';

import { cn } from '@/lib/utils/cn';

import './globals.css';
import { Providers } from './providers';

const pretendard = localFont({
  src: './assets/fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  weight: '45 920',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  ),
  title: 'K-TEST',
  description: 'Online Korean Test Service',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(pretendard.variable, 'h-full antialiased')}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
