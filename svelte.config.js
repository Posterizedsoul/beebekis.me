import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { codeToHtml } from 'shiki';
import { config as dotenvConfig } from 'dotenv'; // Import dotenv

// Load environment variables from .env file
dotenvConfig();
/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
    extensions: ['.md'],
    highlight: {
        // Use shiki's codeToHtml directly
        highlighter: async (code, lang = 'text') => {
            // Define the color replacement map
            const colorReplacements = {
                '#1d2021': '#ffffff' // Replace the dark background with white
                // Add other replacements here if needed
            };

            let html = await codeToHtml(code, {
                lang,
                theme: 'gruvbox-dark-hard', // Keep the original theme
                // colorReplacements // Apply the color replacements
            });

            // Escape curly braces for Svelte processing
            html = html.replace(/{/g, '&lbrace;').replace(/}/g, '&rbrace;');

            // Return the processed HTML string
            return html;
        }
    }
    // Add other mdsvex options here if you have them (e.g., layouts, remarkPlugins)
};

const config = {
    extensions: ['.svelte', '.md'],

    preprocess: [mdsvex(mdsvexOptions), vitePreprocess()],

    kit: {
        adapter: adapter({
            // Vercel Image Optimization configuration
            // See: https://svelte.dev/docs/kit/adapter-vercel#image-optimization
            images: {
                sizes: [640, 828, 1200, 1920, 3840], // Example sizes
                formats: ['image/avif', 'image/webp'], // Example formats
                minimumCacheTTL: 300, // Example cache TTL (5 minutes)
                // Add domains for external images if needed, e.g.,
                // domains: ['your-cms.com'],
            },
            // Incremental Static Regeneration (ISR) configuration
            // See: https://svelte.dev/docs/kit/adapter-vercel#incremental-static-regeneration
            // This applies globally unless overridden in specific routes
            isr: {
                // Expiration time (in seconds) before the cached asset will be re-generated.
                // Set to false to never expire (requires bypassToken for manual regeneration)
                // Example: 1 day expiration
                expiration: 60 * 60 * 24 * 30,

                // Optional: A token to bypass the cache and force regeneration.
                // Set this in your Vercel environment variables (Settings > Environment Variables)
                // Generate a secure token, e.g., using `crypto.randomUUID()` in browser console
                // or `openssl rand -hex 32` in terminal
                bypassToken: process.env.BYPASS_TOKEN,

                // Optional: Query parameters that should be considered part of the cache key.
                // By default, all query params are ignored.
                // allowQuery: ['search', 'page']
            }
        })
        // ... other kit options
    }
};

export default config;
