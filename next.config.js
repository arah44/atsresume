/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['avatars.githubusercontent.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.licdn.com',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Fix for pdfjs-dist in Next.js
    if (!isServer) {
      config.resolve.alias.canvas = false;

      // Exclude pdfjs-dist from webpack processing - let it load naturally
      config.externals = config.externals || [];
      config.externals.push({
        canvas: 'canvas',
      });
    }

    return config;
  },
}

module.exports = nextConfig