/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'date-fns': 'date-fns/esm',
      }
    }
    return config;
  },
  transpilePackages: ['date-fns', 'react-day-picker'],
}

module.exports = nextConfig 