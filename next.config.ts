import type { NextConfig } from "next";

const BACKEND_URL = process.env.API_URL ?? 'http://10.0.0.8:3900';

const nextConfig: NextConfig = {
  // Allow the VPN IP to connect to the dev server (HMR WebSocket + assets)
  allowedDevOrigins: ['10.0.0.8'],

  // Proxy all /api/* requests to the backend — keeps browser requests
  // same-origin and avoids CORS entirely.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

