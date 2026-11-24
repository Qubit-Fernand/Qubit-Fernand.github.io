// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})

module.exports = withBundleAnalyzer({
  staticPageGenerationTimeout: 300,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      // chrome-aws-lambda tries puppeteer first and falls back to puppeteer-core.
      // Both resolve to the installed, version-matched core package on the server.
      config.resolve.alias.puppeteer = path.dirname(
        require.resolve('puppeteer-core/package.json')
      )
    }
    return config
  },
  images: {
    domains: [
      'www.notion.so',
      'notion.so',
      'images.unsplash.com',
      'pbs.twimg.com',
      'abs.twimg.com',
      's3.us-west-2.amazonaws.com',
      'transitivebullsh.it'
    ],
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  }
})
