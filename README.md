# BB Portfolio - SvelteKit Project

This is a personal portfolio website built with SvelteKit, featuring a blog and a gallery of personal memories.

## Tech Stack

- **Framework:** SvelteKit
- **Package Manager/Runtime:** Bun
- **Styling:** Tailwind CSS
- **Content:** Markdown (`.md`) files
  - **Blog Posts:** Markdown with YAML frontmatter.
  - **Memories Metadata:** YAML frontmatter within `info.md`.
  - **Memories Content:** Markdown within `content.md`.
- **Markdown Parsing:** `marked`
- **YAML Parsing:** `js-yaml` (via `yaml` package)
- **Fonts:** Google Fonts (Noto Serif, Playfair Display)
- **Formatting:** Prettier with Svelte & Tailwind plugins

## Getting Started

To get a local copy up and running, follow these simple steps.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Posterizedsoul/beebekis.me.git
    ```
2.  **Navigate into the project directory:**
    ```bash
    cd beebekis.me
    ```
3.  **Install dependencies:** (See Developing section below)

## Developing

Once you've cloned the project (or created a new one) and are in the project directory, install dependencies and start the development server:

```bash
# Install dependencies
bun install

# Start the development server
bun run dev

# or start the server and open the app in a new browser tab
bun run dev -- --open
```

The site should now be running on `http://localhost:5173` (or the next available port).

## Content Management

- **Blog Posts:** Located in `src/lib/posts`. Each post is a Markdown file (`.md`) containing YAML frontmatter for metadata (like `title`, `date`, `excerpt`) followed by the main content.
- **Memories:** Located in `src/lib/assets/Memories`. Each memory is represented by a directory (e.g., `src/lib/assets/Memories/my-trip`).
  - `info.md`: Contains YAML frontmatter defining the memory's metadata (`title`, `date`, `description`, `coverImage`, `images` list with filenames/alt text).
  - `content.md` (Optional): Contains the main narrative or description for the memory in Markdown format.
  - Image Files: All associated images (`.jpg`, `.png`, etc.) are placed directly within the memory's directory. The `+page.server.ts` files handle resolving image paths and generating previews.

## Building

To create a production version of your app:

```bash
bun run build
```

The build output will be generated in the `.cloudflare` directory (or as configured by the adapter), ready for deployment.

You can preview the production build locally using Wrangler:

```bash
# Make sure wrangler is installed (npm install -g wrangler or bun install -g wrangler)
# You might need to log in: wrangler login
wrangler pages dev .cloudflare/worker --compatibility-date=2025-04-20
# Adjust the directory if your adapter outputs elsewhere
```

> **Note:** This project is configured for deployment to [Cloudflare Pages](https://pages.cloudflare.com/) using `@sveltejs/adapter-cloudflare`. Check the `svelte.config.js` file for adapter configuration. Feel free to put up any pull request. Only tested on Linux Mint with Google Chrome and Firefox. I don't and don't have a way to know how it will look up in the Safari. Don't look for incremental upgrades, this is most likely a final version, although I am thinking of putting up a daily journal too. Not addition of dark mode is intentional. I don't care about license, you are free to use this repo however you like just replace my personal files.
