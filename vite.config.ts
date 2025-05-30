import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img'; // Import the plugin
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		enhancedImages(), // Keep enhancedImages first or try moving it last if issues persist
		sveltekit(),      // sveltekit() before tailwindcss()
		tailwindcss()     // tailwindcss() after sveltekit()
	],
	server: {
		host: true,
		port: 5173 // Specify the port
	}
});
