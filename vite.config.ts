import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img'; // Import the plugin
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		enhancedImages(), // Add the plugin HERE, before sveltekit()
		tailwindcss(),
		sveltekit()
	],
	server: {
		host: true,
		port: 5173 // Specify the port
	}
});
