/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        {
          'playwright-core': 'commonjs2 playwright-core',
          '@sparticuz/chromium': 'commonjs2 @sparticuz/chromium',
        },
      ];
    }
    return config;
  },
};

module.exports = nextConfig;
