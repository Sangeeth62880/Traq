/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Background
                'bg-primary': '#05060F',
                'bg-secondary': '#0D1117',
                // Surface
                'surface': '#161B22',
                // Border
                'traq-border': '#21262D',
                // Accents
                'accent-blue': '#2F80ED',
                'accent-orange': '#F97316',
                // Status
                'success': '#22C55E',
                'warning': '#FACC15',
                'danger': '#EF4444',
                // Text
                'text-primary': '#F0F6FC',
                'text-secondary': '#8B949E',
                'text-muted': '#484F58',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
