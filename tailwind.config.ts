import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FAFAF9",
        ink: "#1A1A1A",
        accent: {
          DEFAULT: "#2E5FB8",
          contrast: "#B85C3A",
        },
        muted: {
          DEFAULT: "#6B6B6B",
          soft: "#E7E5E4",
          softer: "#F1EFEE",
        },
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        reading: "600px",
      },
      boxShadow: {
        paper: "0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
