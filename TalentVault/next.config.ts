import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Add headers for Content Security Policy
  async headers() {
    return [
      {
        source: "/(.*)", // Apply to all routes
        headers: [
          {
            key: "Content-Security-Policy",
            value: `default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' *.vercel.com *.gstatic.com vercel.live r2cdn.perplexity.ai; connect-src 'self';` // More comprehensive CSP
          },
        ],
      },
    ];
  },
};

export default nextConfig;
