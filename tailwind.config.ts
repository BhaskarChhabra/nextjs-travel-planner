import type { Config } from "tailwindcss";
import { heroui } from "@heroui/theme";  // Preferred import source

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "blue-text-title": "#243757",
        "dark-purple": "#2c003e",
        "mid-purple": "#600047",
        "light-purple": "#8b004f",
        "dark-red": "#b30054",
        "mid-red": "#d90057",
        "light-red": "#ff005a",
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};

export default config;