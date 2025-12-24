import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  /* config options here */
  // Add headers for Content Security Policy
  async headers() {
    const scriptSrc = ["'self'", "'unsafe-eval'", "'unsafe-inline'"].join(" ");
    const connectSrc = [
      "'self'",
      "https://identitytoolkit.googleapis.com",
      "https://firebase.googleapis.com",
      "https://firestore.googleapis.com",
    ].join(" ");

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
              "font-src 'self' *.gstatic.com r2cdn.perplexity.ai",
              `connect-src ${connectSrc}`,
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
