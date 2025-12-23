import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Add headers for Content Security Policy
  async headers() {
    const scriptSrc = [
      "'self'",
      "'unsafe-eval'",
      "'unsafe-inline'",
      "https://vercel.live",
    ].join(" ");
    const connectSrc = ["'self'", "https://vercel.live"].join(" ");

    return [
      {
        source: "/(.*)", // Apply to all routes
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src ${scriptSrc}`,
              `script-src-elem ${scriptSrc}`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data:",
              "font-src 'self' *.vercel.com *.gstatic.com vercel.live r2cdn.perplexity.ai",
              `connect-src ${connectSrc}`,
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
