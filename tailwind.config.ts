import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        sidebar: "#f9f9f9",
        "sidebar-hover": "#f0f0f0",
        "sidebar-active": "#e5e5e5",
        surface: "#f7f7f8",
        "surface-hover": "#ececec",
        border: "#e5e5e5",
        primary: "#10a37f",
        "primary-hover": "#0d8f6e",
        "text-primary": "#0d0d0d",
        "text-secondary": "#6e6e80",
        input: "#ffffff",
        destructive: "#ef4444",
        success: "#22c55e",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "pulse-ring-light": {
          "0%": { boxShadow: "0 0 0 0 rgba(16, 163, 127, 0.35)" },
          "70%": { boxShadow: "0 0 0 14px rgba(16, 163, 127, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(16, 163, 127, 0)" },
        },
        "pulse-mic-idle": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.03)", opacity: "0.92" },
        },
        bar: {
          "0%, 100%": { transform: "scaleY(0.35)" },
          "50%": { transform: "scaleY(1)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-ring-light": "pulse-ring-light 1.6s ease-out infinite",
        "pulse-mic-idle": "pulse-mic-idle 2.2s ease-in-out infinite",
        bar: "bar 0.9s ease-in-out infinite",
        "fade-up": "fade-up 0.45s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
