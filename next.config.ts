import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Handle WebAssembly files for Tesseract.js
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };
    
    // Add rule for .wasm files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });

    return config;
  },
  
  // Allow external domains for Tesseract.js CDN resources
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=()',
          },
        ],
      },
    ];
  },
  
  // Development server configuration
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
};

export default nextConfig;
