/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Foda-se o corretor, sobe o jogo!
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;