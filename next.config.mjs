export default {
  reactStrictMode: true,
  experimental: {
    staleTimes: {
      dynamic: 0,
    },
  },
  transpilePackages: [
    "@pantheon-systems/css-client",
    "@pantheon-systems/puck-css",
    "@pantheon-systems/p1-next-sdk",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "encrypted-tbn0.gstatic.com" },
      { protocol: "https", hostname: "pantheon.io" },
      { protocol: "https", hostname: "p1-media.chris-801.workers.dev" },
      { protocol: "https", hostname: "media.p1.pantheon.io" },
    ],
  },
  async redirects() {
    return [
      // Serve the built Storybook (public/storybook/) at a clean /storybook path.
      { source: "/storybook", destination: "/storybook/index.html", permanent: false },
    ];
  },
};
