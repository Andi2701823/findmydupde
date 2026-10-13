import shared from "../tailwind.config.ts";
const config = {
  ...shared,
  content: {
    relative: true,
    files: ["../app/**/*.{ts,tsx}", "../components/**/*.{ts,tsx}"],
  },
};

export default config;
