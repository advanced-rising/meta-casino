const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Turbopack config (used in dev with --turbopack flag)
  turbopack: {
    rules: {
      '*.glsl': { loaders: ['raw-loader'] },
      '*.vert': { loaders: ['raw-loader'] },
      '*.frag': { loaders: ['raw-loader'] },
    },
  },

  webpack(config) {
    // shader support (for production build)
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: ['raw-loader', 'glslify-loader'],
    })

    return config
  },
}

module.exports = withBundleAnalyzer(nextConfig)
