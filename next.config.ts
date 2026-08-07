import type { NextConfig } from 'next';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://34.69.1.227:3000';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'hidvjegsroyezjruhkcg.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // 백엔드 CORS_ORIGIN이 localhost:5173으로 고정돼 있어서(localhost:3000 미허용),
  // 브라우저가 직접 백엔드를 호출하면 CORS로 막힘.
  // Next.js 서버가 대신 호출하도록 프록시해서 우회 (백엔드 CORS 설정 고쳐지면 제거 가능).
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
