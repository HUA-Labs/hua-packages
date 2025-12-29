/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    // Include hua-ux package components (source files)
    '../../packages/hua-ux/src/**/*.{ts,tsx}',
    '../../packages/hua-ui/src/**/*.{ts,tsx}',
    // Include dist files as well (for built components)
    '../../packages/hua-ux/dist/**/*.{js,mjs}',
    '../../packages/hua-ui/dist/**/*.{js,mjs}',
  ],
  // Tailwind 4: Theme variables should be moved to @theme in globals.css
  // Safelist for Button component classes that might not be detected
  safelist: [
    // Button variant classes
    'bg-blue-600',
    'text-white',
    'hover:bg-blue-700',
    'dark:bg-blue-500',
    'dark:hover:bg-blue-600',
    'border-2',
    'border-blue-600',
    'bg-transparent',
    'text-blue-600',
    'hover:bg-blue-50',
    'dark:border-blue-400',
    'dark:text-blue-400',
    'dark:hover:bg-blue-900/20',
    // Button size classes
    'h-8', 'h-10', 'h-12', 'h-14',
    'px-3', 'px-4', 'px-6', 'px-8',
    'py-1', 'py-2', 'py-3', 'py-4',
    'text-sm', 'text-base', 'text-lg', 'text-xl',
    // Button hover effects
    'hover:scale-105',
    'transition-transform',
    'duration-200',
  ],
}
