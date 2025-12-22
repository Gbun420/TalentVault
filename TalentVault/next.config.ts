import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Add headers for Content Security Policy
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `font-src 'self' *.vercel.com *.gstatic.com vercel.live r2cdn.perplexity.ai;` // Added r2cdn.perplexity.ai
          },
        ],
      },
    ];
  },
};

export default nextConfig;