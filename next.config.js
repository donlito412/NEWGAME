// next.config.js - limit pageExtensions to JS/JSX to avoid duplicate route conflicts
// This tells the bundler to ignore .ts/.tsx files for route registration so only .jsx/.js pages are used.
// If you prefer TypeScript routes, we can instead add full TypeScript support in CI.

module.exports = {
  experimental: {
    appDir: true,
  },
  // Only consider these extensions as route files. Excludes .ts/.tsx so duplicate /demo route is resolved.
  pageExtensions: ['js', 'jsx', 'md', 'mdx'],
};
