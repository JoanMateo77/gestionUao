import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Tokens mapeados a variables CSS existentes (compatibilidad)
        primary: {
          DEFAULT: "var(--primary)",
          dark: "var(--primary-dark)",
          50: "#f7f7f8",
          100: "#eeeef0",
          200: "#d9d9dd",
          300: "#b8b8bf",
          400: "#8f8f99",
          500: "#6b6b75",
          600: "#4e4e57",
          700: "#3a3a42",
          800: "#26262c",
          900: "#1a1a1a",
          950: "#000000",
        },
        accent: {
          DEFAULT: "var(--accent)",
          light: "var(--accent-light)",
          dark: "var(--accent-dark)",
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
          950: "#450a0a",
        },
        success: {
          DEFAULT: "var(--success)",
          bg: "var(--success-bg)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          bg: "var(--warning-bg)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          bg: "var(--danger-bg)",
        },
        info: {
          DEFAULT: "var(--info)",
          bg: "var(--info-bg)",
        },
        surface: {
          DEFAULT: "var(--bg-primary)",
          card: "var(--bg-card)",
          input: "var(--bg-input)",
          secondary: "var(--bg-secondary)",
        },
        content: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        border: {
          DEFAULT: "var(--border)",
          hover: "var(--border-hover)",
          focus: "var(--border-focus)",
        },
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
        xs: ["0.75rem", { lineHeight: "1.1rem" }],
        sm: ["0.85rem", { lineHeight: "1.25rem" }],
        base: ["0.95rem", { lineHeight: "1.45rem" }],
        lg: ["1.1rem", { lineHeight: "1.6rem" }],
        xl: ["1.35rem", { lineHeight: "1.8rem" }],
        "2xl": ["1.6rem", { lineHeight: "2rem" }],
      },
      spacing: {
        "4.5": "1.125rem",
        "18": "4.5rem",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
    },
  },
  plugins: [],
};
export default config;
