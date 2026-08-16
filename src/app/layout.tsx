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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5173';
const SITE_NAME = 'K-TEST';
const SITE_DESCRIPTION = 'Korean Speaking Proficiency Test for Foreign Workers';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'K-TEST',
    '한국어 말하기 시험',
    'Korean speaking test',
    'Korean proficiency test',
    'EPS-TOPIK',
    '외국인 근로자 한국어 시험',
    'Korean for foreign workers',
    'Korean language exam',
  ],
  alternates: {
    canonical: '/',
  },
  // og:image, twitter:image는 app/opengraph-image.jpg 파일 컨벤션으로 자동 생성됨
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'en_EN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
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
