import type { NextConfig } from 'next';
const config: NextConfig = {
  // OAuth callbacks contain single-use codes; do not print request URLs.
  logging: {
    incomingRequests: false,
    fetches: { fullUrl: false },
    browserToTerminal: false,
  },
  devIndicators: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },
};
export default config;
