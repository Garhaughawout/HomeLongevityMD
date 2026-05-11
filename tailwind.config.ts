import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // API method chip fills
    "bg-sky-600", "bg-emerald-600", "bg-amber-500", "bg-violet-600", "bg-rose-600",
    // API method row borders + backgrounds
    "border-sky-500", "bg-sky-50",
    "border-emerald-500", "bg-emerald-50",
    "border-amber-500", "bg-amber-50",
    "border-violet-500", "bg-violet-50",
    "border-rose-500", "bg-rose-50",
    // Access badge styles
    "border-amber-400", "bg-amber-50", "text-amber-800",
    "border-sky-400", "bg-sky-50", "text-sky-800",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
export default config;
