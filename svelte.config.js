import adapter from '@sveltejs/adapter-cloudflare'; // <-- Change this line
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { codeToHtml } from 'shiki'; // <-- Import codeToHtml directly

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

/** @type {import('@sveltejs/kit').Config} */
const config = {
    extensions: ['.svelte', '.md'],

    preprocess: [mdsvex(mdsvexOptions), vitePreprocess()],

    kit: {
        adapter: adapter({
            // See documentation for options: https://kit.svelte.dev/docs/adapter-cloudflare
            routes: {
                include: ['/*'],
                exclude: ['<all>']
            }
        })
        // ... other kit options
    }
};

export default config;
