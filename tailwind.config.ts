import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-montserrat)", "ui-sans-serif", "system-ui"],
      },
      colors: {
        surface: "#0f172a",
        muted: "#64748b"
      }
    },
  },
  plugins: [],
};

export default config;
