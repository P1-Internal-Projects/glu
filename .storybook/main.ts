import type { StorybookConfig } from "@storybook/nextjs";

// `storybook build` outputs into public/storybook, so it cannot also copy
// ../public as a static dir (the output would be nested inside its own source).
// In dev we DO need it so the Next public/ assets load at their root paths.
const isBuild = process.argv.includes("build");

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(ts|tsx)"],
  staticDirs: isBuild ? [] : ["../public"],
  addons: ["@storybook/addon-a11y"],
  framework: { name: "@storybook/nextjs", options: {} },
};

export default config;
