import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#253831",
        leaf: "#29734f",
        lime: "#d6f39b",
        cream: "#f7f8f2",
      },
    },
  },
  plugins: [],
} satisfies Config;
