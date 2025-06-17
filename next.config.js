const nextConfig = {
  /* config options here */
  // allowedDevOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost',
    'http://127.0.0.1',
    'http://martclinic.duckdns.org',
    'https://martclinic.duckdns.org',
    'http://martclinic.duckdns.org:3000',
    'https://martclinic.duckdns.org:3000'
  ],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ]
  },
};

module.exports = nextConfig;
