/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      // Restore the typography customization block
      typography: ({ theme }) => ({
        DEFAULT: { // Target the default 'prose' class
          css: {
            // Reset styles applied by @tailwindcss/typography to prevent conflicts with Shiki
            pre: null, // Disable default <pre> styling
            code: null, // Disable default <code> styling
            'code::before': null, // Disable default pseudo-elements
            'code::after': null,
            // Apply this reset to other variants if you use them (e.g., prose-lg)
          },
        },
        // Example: Resetting for prose-lg as well, since it's used in the layout
        lg: {
           css: {
            pre: null,
            code: null,
            'code::before': null,
            'code::after': null,
           },
        },
        // Add resets for other sizes (sm, xl, 2xl) if you use them
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'), // Restore the typography plugin
  ],
}
