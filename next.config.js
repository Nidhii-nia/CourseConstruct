/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable aggressive build caching in development
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 60 * 1000, // 60 seconds
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 5,
  },

  // Improve stability
  experimental: {
    // Disable static page generation optimization issues
    isrMemoryCacheSize: 0,
  },

  // Better error handling
  typescript: {
    ignoreBuildErrors: false,
  },

  // Ensure routes are always fresh
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },

  // ✅ Allow loading images from Firebase Storage
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
};

export default nextConfig;
