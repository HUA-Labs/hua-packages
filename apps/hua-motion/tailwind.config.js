/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Tailwind 4: Most configuration is now in CSS files using @theme
  // Plugins are imported in CSS: @import "@tailwindcss/typography";
  // Theme variables should be moved to @theme in globals.css
} 