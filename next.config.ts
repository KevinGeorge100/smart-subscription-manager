import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Enable strict type checking for production builds
    ignoreBuildErrors: false,
  },
  eslint: {
    // Enable ESLint checking for production builds
    ignoreDuringBuilds: false,
  },
  // Optimize for Vercel serverless deployment
  serverExternalPackages: ['firebase-admin', 'nodemailer'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
