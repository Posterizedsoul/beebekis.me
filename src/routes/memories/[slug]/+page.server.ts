import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'yaml'; // Use default import
import { marked } from 'marked'; // For parsing Markdown content

// Define the expected shape of memoir metadata from info.md
interface MemoirMetadata {
    title: string;
    date: string;
    description?: string;
    coverImage?: string; // Can be used as fallback hero
    heroImage?: string; // Optional specific hero image filename
    images?: { filename: string; alt?: string }[];
    [key: string]: any; // Allow other properties
}

// Define the shape of image data to be passed to the page
interface ImageInfo {
    src: string;
    alt: string;
    filename: string; // Keep filename for matching
}

// Pre-fetch all image modules using import.meta.glob
const allImageModules = import.meta.glob('/src/lib/assets/Memories/**/*.+(avif|gif|heif|jpeg|jpg|png|tiff|webp)', { eager: true });

// Helper to resolve image URLs safely using the pre-fetched modules
// Simplified: Removed dynamic import
async function resolveImageUrl(
    baseImportPath: string, // e.g., /src/lib/assets/Memories/slug
    filename: string | null // e.g., image.jpg
): Promise<string | null> {
    if (!filename) return null;

    const imageImportPath = `${baseImportPath}/${filename}`; // Construct the full path key

    // Find the module in the glob results
    const imageModule = allImageModules[imageImportPath] as { default: string } | undefined;

    if (imageModule && imageModule.default) {
        return imageModule.default; // Return the resolved URL from glob
    } else {
        console.warn(`[${baseImportPath.split('/').pop()}] Could not find image module for "${filename}" via glob.`);
        return null; // Return null if not found in glob results
    }
}

export const load: PageServerLoad = async ({ params }) => {
    const { slug } = params;
    const viteImportPathBase = `/src/lib/assets/Memories/${slug}`;
    const memoirDirRelative = path.join('src/lib/assets/Memories', slug);
    console.log(`[${slug}] Loading memoir...`);

    let metadata: MemoirMetadata | null = null;

    try {
        // --- Metadata Loading using Glob ---
        const infoMdPath = `/src/lib/assets/Memories/${slug}/info.md`;
        const infoMdModules = import.meta.glob('/src/lib/assets/Memories/*/info.md', { query: '?raw', import: 'default' });

        const moduleResolver = infoMdModules[infoMdPath];

        if (!moduleResolver) {
            console.error(`[${slug}] info.md module not found via glob for path: ${infoMdPath}`);
            error(404, `Memoir metadata file not found: ${slug}`);
        }

        const fileContent = await moduleResolver() as string;
        console.log(`[${slug}] Raw info.md content length:`, fileContent?.length);

        // Extract frontmatter block more robustly
        let frontmatterContent: string | null = null;
        const parts = fileContent.split('---');
        if (parts.length >= 3) {
            // Expecting: ['', frontmatter, rest_of_file_or_empty]
            frontmatterContent = parts[1]?.trim(); // Get content between the first two '---'
        } else {
            console.warn(`[${slug}] Could not split info.md content by '---' as expected.`);
        }

        if (!frontmatterContent) {
            console.error(`[${slug}] Frontmatter content could not be extracted.`);
            error(500, `Could not extract memoir metadata: ${slug}`);
        }

        console.log(`[${slug}] Extracted frontmatter content:\n---\n${frontmatterContent}\n---`);

        // Parse the extracted frontmatter
        let parsedMetadata: MemoirMetadata | null = null;
        try {
            parsedMetadata = yaml.parse(frontmatterContent) as MemoirMetadata; // Use default import 'yaml.parse'
        } catch (parseError) {
            console.error(`[${slug}] Error parsing YAML frontmatter:`, parseError);
            console.error(`[${slug}] Content attempted to parse:\n---\n${frontmatterContent}\n---`);
            error(500, `Could not parse memoir metadata: ${slug}`);
        }

        if (!parsedMetadata || !parsedMetadata.title || !parsedMetadata.date) {
            console.error(`[${slug}] Invalid or incomplete metadata parsed from info.md. Parsed:`, parsedMetadata);
            error(404, `Invalid memoir metadata: ${slug}`);
        }
        metadata = parsedMetadata;
        console.log(`[${slug}] Metadata loaded successfully (assigned):`, metadata);

        // --- Image Processing ---

        // 1. Determine image filenames
        console.log(`[${slug}] Determining image filenames...`);
        let allFilenames: string[] = [];

        if (metadata?.images && metadata.images.length > 0) {
             // Prioritize filenames listed in metadata
             allFilenames = metadata.images.map(img => img.filename);
             console.log(`[${slug}] Using image filenames from metadata.images.`);
        } else {
             console.warn(`[${slug}] No valid 'images' array found in metadata, falling back to reading directory (may fail in deployment). Metadata was:`, metadata);
             allFilenames = [];
        }
        console.log(`[${slug}] Determined filenames to process:`, allFilenames);

        // 2. Create a lookup map for alt text from metadata.images (if it exists)
        const altTextMap = new Map<string, string>();
        if (metadata?.images && metadata.images.length > 0) {
            console.log(`[${slug}] Processing alt text from metadata.images...`);
            metadata.images.forEach(img => {
                if (img.filename && img.alt) {
                    altTextMap.set(img.filename, img.alt);
                }
            });
        } else {
            console.log(`[${slug}] No metadata.images array found or empty, skipping alt text map creation.`);
        }

        // 3. Create imageInfos by combining found files and alt text lookup
        const imageInfos: { filename: string; alt: string }[] = allFilenames.map(filename => {
            const specificAlt = altTextMap.get(filename);
            const alt = specificAlt || metadata?.title || 'Memoir image';
            return { filename, alt };
        });
        console.log(`[${slug}] Image infos to resolve (combined):`, imageInfos);

        // 4. Resolve all image URLs
        const resolvedImages: (ImageInfo | null)[] = await Promise.all(
            imageInfos.map(async (info) => {
                const src = await resolveImageUrl(viteImportPathBase, info.filename);
                if (src) {
                    return { src, alt: info.alt, filename: info.filename };
                }
                return null;
            })
        );

        const allImages = resolvedImages.filter((img): img is ImageInfo => img !== null);
        console.log(`[${slug}] All resolved images (for lightbox):`, allImages);

        // 5. Separate Hero and Gallery images
        let heroImage: ImageInfo | null = null;
        let galleryImages: ImageInfo[] = [];

        if (allImages.length > 0) {
            if (metadata.heroImage) {
                heroImage = allImages.find(img => img.filename === metadata.heroImage) || null;
                if (heroImage) {
                    console.log(`[${slug}] Found specified hero image: ${metadata.heroImage}`);
                } else {
                    console.warn(`[${slug}] Specified hero image "${metadata.heroImage}" not found in resolved images. Falling back to first image.`);
                }
            }

            if (!heroImage) {
                heroImage = allImages[0];
                console.log(`[${slug}] Using first image as hero: ${heroImage.filename}`);
            }

            galleryImages = allImages.filter(img => img.src !== heroImage?.src);
        }

        console.log(`[${slug}] Hero image:`, heroImage);
        console.log(`[${slug}] Gallery images (for masonry):`, galleryImages);

        // --- Content Processing ---
        let contentHtml = '';
        const contentPath = path.join(memoirDirRelative, 'content.md');
        try {
            const contentMd = await fs.readFile(contentPath, 'utf-8');
            contentHtml = marked.parse(contentMd);
        } catch (e) {
            console.warn(`[${slug}] No content.md found or error parsing.`);
        }

        console.log(`[${slug}] Returning data to page.`);
        return {
            title: metadata.title,
            date: metadata.date,
            description: metadata.description,
            heroImage: heroImage,       // The determined hero image object
            galleryImages: galleryImages, // The remaining images for the gallery
            allImages: allImages,       // All images for the lightbox
            contentHtml: contentHtml    // Parsed HTML content
        };

    } catch (err: any) {
        console.error(`Error loading memoir ${slug}:`, err);
        if (err.status) {
            throw err;
        }
        error(500, `Could not load memoir ${slug}`);
    }
};

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