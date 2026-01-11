/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./utils/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                primary: 'hsl(var(--primary-h) var(--primary-s) var(--primary-l) / <alpha-value>)', // Custom Dynamic
                'primary-hover': 'hsl(var(--primary-h) var(--primary-s) var(--primary-l-hover) / <alpha-value>)',
                'primary-active': 'hsl(var(--primary-h) var(--primary-s) var(--primary-l-active) / <alpha-value>)',
                secondary: '#334155', // Slate 700
                accent: 'hsl(var(--primary-h) var(--primary-s) var(--primary-l) / <alpha-value>)', // Matching Dynamic
                success: '#10b981', // Emerald 500
                warning: '#f59e0b', // Amber 500
                danger: '#ef4444', // Red 500
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out forwards',
            }
        },
    },
    plugins: [],
}
