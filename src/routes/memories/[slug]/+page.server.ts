import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';
import { parse } from 'yaml'; // Changed import style
import { marked } from 'marked'; // For parsing Markdown content

// Define the expected shape of memoir metadata from info.md
interface MemoirMetadata {
    title: string;
    date: string;
    description?: string;
    coverImage?: string; // Can be used as fallback hero
    images?: { filename: string; alt?: string }[];
    [key: string]: any; // Allow other properties
}

// Define the shape of image data to be passed to the page
interface ImageInfo {
    src: string;
    alt: string;
}

export const load: PageServerLoad = async ({ params }) => {
    const { slug } = params;
    const memoirDir = path.join('src/lib/assets/Memories', slug); // Updated directory path
    const viteImportPathBase = `/src/lib/assets/Memories/${slug}`; // Updated Vite import base path
    console.log(`[${slug}] Loading memoir...`);

    try {
        const metadata = await readMemoirInfo(memoirDir);

        if (!metadata) {
            console.error(`[${slug}] Metadata not found or invalid.`);
            error(404, `Memoir not found: ${slug}`);
        }
        console.log(`[${slug}] Metadata loaded:`, metadata);

        // --- Image Processing (Revised Logic) ---

        // 1. Always find all image filenames in the directory
        console.log(`[${slug}] Finding all image files in directory...`);
        const allFilenames = await findImageFilenames(memoirDir);
        console.log(`[${slug}] Found image files:`, allFilenames);

        // 2. Create a lookup map for alt text from metadata.images (if it exists)
        const altTextMap = new Map<string, string>();
        if (metadata.images && metadata.images.length > 0) {
            console.log(`[${slug}] Processing alt text from metadata.images...`);
            metadata.images.forEach(img => {
                if (img.filename && img.alt) {
                    altTextMap.set(img.filename, img.alt);
                }
            });
        } else {
            console.log(`[${slug}] No metadata.images array found, will use fallback alt text.`);
        }

        // 3. Create imageInfos by combining found files and alt text lookup
        const imageInfos: { filename: string; alt: string }[] = allFilenames.map(filename => {
            const specificAlt = altTextMap.get(filename);
            const alt = specificAlt || metadata.title || 'Memoir image'; // Use specific alt, or fallback to title
            return { filename, alt };
        });

        console.log(`[${slug}] Image infos to resolve (combined):`, imageInfos);

        // 4. Resolve all image URLs
        const resolvedImages: (ImageInfo | null)[] = await Promise.all(
            imageInfos.map(async (info) => {
                const src = await resolveImageUrl(viteImportPathBase, info.filename);
                if (src) {
                    return { src, alt: info.alt };
                }
                return null;
            })
        );

        const allImages = resolvedImages.filter((img): img is ImageInfo => img !== null);
        console.log(`[${slug}] All resolved images (for lightbox):`, allImages);

        // 5. Separate Hero and Gallery images (no change here)
        const heroImage = allImages.length > 0 ? allImages[0] : null;
        const galleryImages = allImages.length > 1 ? allImages.slice(1) : [];
        console.log(`[${slug}] Hero image:`, heroImage);
        console.log(`[${slug}] Gallery images (for masonry):`, galleryImages);

        // --- Content Processing ---
        let contentHtml = '';
        const contentPath = path.join(memoirDir, 'content.md'); // Assuming content is in content.md
        try {
            const contentMd = await fs.readFile(contentPath, 'utf-8');
            contentHtml = marked.parse(contentMd); // Parse Markdown to HTML
        } catch (e) {
            console.warn(`[${slug}] No content.md found or error parsing.`);
        }

        console.log(`[${slug}] Returning data to page.`);
        return {
            title: metadata.title,
            date: metadata.date,
            description: metadata.description,
            heroImage: heroImage,       // The first image for the hero section
            galleryImages: galleryImages, // The rest for the masonry grid
            allImages: allImages,       // All images for the lightbox
            contentHtml: contentHtml    // Parsed HTML content
        };

    } catch (err: any) {
        console.error(`Error loading memoir ${slug}:`, err);
        // Handle file not found specifically for the directory itself
        if (err.code === 'ENOENT') {
            error(404, `Memoir not found: ${slug}`);
        }
        error(500, `Could not load memoir ${slug}`);
    }
};

// Make sure readMemoirInfo is defined correctly if it wasn't already
async function readMemoirInfo(dirPath: string): Promise<MemoirMetadata | null> {
    const infoPath = path.join(dirPath, 'info.md');
    try {
        const content = await fs.readFile(infoPath, 'utf-8');
        const frontmatterMatch = content.match(/---\s*([\s\S]*?)\s*---/);
        if (frontmatterMatch && frontmatterMatch[1]) {
            return parse(frontmatterMatch[1]) as MemoirMetadata;
        }
        return null; // No frontmatter found
    } catch (e: any) {
        // If info.md doesn't exist, it's a critical error for this page
        if (e.code === 'ENOENT') {
             console.error(`info.md not found in ${dirPath}`);
             return null;
        }
        console.warn(`Could not read or parse info.md in ${dirPath}:`, e);
        return null;
    }
}

// Make sure findImageFilenames is defined correctly
async function findImageFilenames(dirPath: string, limit: number = Infinity): Promise<string[]> {
    try {
        const files = await fs.readdir(dirPath);
        const imageFiles = files.filter((file) =>
            /\.(avif|gif|heif|jpeg|jpg|png|tiff|webp)$/i.test(file)
        );
        return imageFiles.slice(0, limit);
    } catch (e) {
        console.warn(`Could not read directory or find images in ${dirPath}:`, e);
        return [];
    }
}

// Make sure resolveImageUrl is defined correctly
async function resolveImageUrl(
    baseImportPath: string,
    filename: string | null
): Promise<string | null> {
    if (!filename) return null;
    const imageImportPath = `${baseImportPath}/${filename}`;
    try {
        // Use dynamic import with Vite's handling - remove /* @vite-ignore */
        const imageModule = await import(imageImportPath);
        return imageModule.default;
    } catch (imgErr: any) { // Catch specific error
     
        console.warn(`[${baseImportPath.split('/').pop()}] Could not load image "${filename}" from "${baseImportPath}". Error: ${imgErr.message || imgErr}`);
        return null;
    }
}