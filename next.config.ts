import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Handle WebAssembly files for Tesseract.js
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    
    // Add rule for .wasm files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });

    // Handle JS worker files properly for Tesseract
    config.module.rules.push({
      test: /worker\.min\.js$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/js/[name].[hash][ext]',
      },
    });

    // Ensure WASM files are copied to public directory in production
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }

    return config;
  },
  
  // Static export and output configuration for Vercel
  output: 'standalone',
  
  // Allow external domains for Tesseract.js CDN resources
  async headers() {
    return [
      {
        source: '/wasm/(.*)',
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
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
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
