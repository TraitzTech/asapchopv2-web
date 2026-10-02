const nextConfig = {
  reactStrictMode: true,
  // Self-contained server bundle (.next/standalone) for the VPS deploy; see deploy/README.md
  output: 'standalone',
  // Tracing only copies @swc/helpers/cjs, but the server also loads its esm build at startup.
  outputFileTracingIncludes: {
    '/*': ['./node_modules/@swc/helpers/esm/**/*'],
  },
  // Hide Next.js dev-mode indicator (bottom-left "N" badge)
  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
  },
  experimental: {
    swcPlugins: [],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'], // Keep error and warn, remove log, info, debug, etc.
    } : false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**', // allows all https domains
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**', // allows all https domains
        pathname: '/**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;



// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   images: {
//     domains: [
//       "bjorn66.com",
//       "6ammart-test.6amdev.xyz",
//       "192.168.50.168",
//       "6ammart-dev.6amdev.xyz",
//     ], // Add the domain here
//   },
// };
//
// module.exports = nextConfig;
