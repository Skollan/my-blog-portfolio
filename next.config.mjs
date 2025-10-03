/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.toutsurgoogle.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Pour tes futures images Supabase
      },
    ],
  },
};

export default nextConfig;
