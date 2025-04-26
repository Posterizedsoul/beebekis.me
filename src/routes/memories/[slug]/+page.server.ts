import path from 'path';
import fs from 'fs/promises';
import yaml from 'js-yaml';
import { error } from '@sveltejs/kit';
import { marked } from 'marked';
import type { PageServerLoad } from './$types';

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

// Pre-fetch all image modules using import.meta.glob, looking inside 'img' subdirectories
const allImageModules = import.meta.glob('/src/lib/assets/Memories/**/img/*.+(avif|gif|heif|jpeg|jpg|png|tiff|webp)', { eager: true });

// Helper to resolve image URLs safely using the pre-fetched modules
// Simplified: Removed dynamic import
async function resolveImageUrl(
    baseImportPath: string, // e.g., /src/lib/assets/Memories/slug
    filename: string | null // e.g., img/image.jpg
): Promise<string | null> {
    if (!filename) return null;

    // Construct the full path key including the 'img' subdirectory if present in filename
    const imageImportPath = `${baseImportPath}/${filename}`; // e.g., /src/lib/assets/Memories/slug/img/image.jpg

    // Find the module in the glob results
    const imageModule = allImageModules[imageImportPath] as { default: string } | undefined;

    if (imageModule && imageModule.default) {
        return imageModule.default; // Return the resolved URL from glob
    } else {
        console.warn(`[${baseImportPath.split('/').pop()}] Could not find image module for "${filename}" via glob key "${imageImportPath}".`);
        // Attempt fallback without base path if filename already looks absolute (less likely needed with glob)
        const fallbackModule = allImageModules[filename] as { default: string } | undefined;
        if (fallbackModule && fallbackModule.default) {
            console.log(`Resolved using fallback key: ${filename}`);
            return fallbackModule.default;
        }
        console.warn(`Still could not resolve image: ${filename}`);
        return null; // Return null if not found in glob results
    }
}

// Helper function to generate alt text from filename (removes 'img/' prefix if present)
function generateAltText(filename: string): string {
    // Remove 'img/' prefix if it exists
    let nameOnly = filename.startsWith('img/') ? filename.substring(4) : filename;
    // Remove extension
    nameOnly = nameOnly.substring(0, nameOnly.lastIndexOf('.')) || nameOnly;
    // Replace separators and capitalize
    nameOnly = nameOnly.replace(/[_-]/g, ' ');
    nameOnly = nameOnly.replace(/\b\w/g, char => char.toUpperCase());
    return nameOnly.trim();
}

export const load: PageServerLoad = async ({ params }) => {
    const { slug } = params;
    const memoirDirRelative = path.join('src', 'lib', 'assets', 'Memories', slug);
    const memoirDirAbsolute = path.resolve(memoirDirRelative);
    const infoPath = path.join(memoirDirAbsolute, 'info.md');
    // Vite needs POSIX paths relative to the project root for glob keys
    const viteImportPathBase = `/src/lib/assets/Memories/${slug}`; // Base path for resolving images

    console.log(`[${slug}] Loading memoir data...`);

    try {
        // 1. Read and parse info.md
        let metadata: MemoirMetadata;
        try {
            const fileContent = await fs.readFile(infoPath, 'utf-8');
            let frontmatterContent: string | null = null;
            const parts = fileContent.split('---');
            if (parts.length >= 3) {
                frontmatterContent = parts[1]?.trim();
            } else {
                console.warn(`[${slug}] Could not split info.md content by '---' as expected.`);
            }

            if (!frontmatterContent) {
                console.error(`[${slug}] Frontmatter content could not be extracted.`);
                error(500, `Could not extract memoir metadata: ${slug}`);
            }

            metadata = yaml.load(frontmatterContent) as MemoirMetadata;

            if (!metadata || !metadata.title || !metadata.date) {
                console.error(`[${slug}] Invalid or incomplete metadata parsed from info.md. Parsed:`, metadata);
                error(404, `Invalid memoir metadata: ${slug}`);
            }
        } catch (err: any) {
            console.error(`[${slug}] Error reading or parsing ${infoPath}:`, err);
            error(404, `Memoir metadata not found or invalid: ${slug}`);
        }

        // 2. Determine filenames to process (primarily from metadata)
        let allFilenames: string[] = [];
        if (metadata.images && Array.isArray(metadata.images) && metadata.images.length > 0) {
            allFilenames = metadata.images
                .map(img => img?.filename)
                .filter((filename): filename is string => typeof filename === 'string' && filename.trim() !== '');
            console.log(`[${slug}] Using image filenames from metadata.images.`);
        } else {
            console.warn(`[${slug}] No valid 'images' array found in metadata. No images will be loaded unless specified in heroImage/coverImage.`);
            allFilenames = [];
        }
        console.log(`[${slug}] Determined filenames to process from metadata:`, allFilenames);

        // Add heroImage and coverImage to the list if they exist and aren't already included
        if (metadata.heroImage && !allFilenames.includes(metadata.heroImage)) {
            allFilenames.push(metadata.heroImage);
        }
        if (metadata.coverImage && !allFilenames.includes(metadata.coverImage)) {
            allFilenames.push(metadata.coverImage);
        }
        // Remove duplicates just in case
        allFilenames = [...new Set(allFilenames)];
        console.log(`[${slug}] Final list of unique filenames to resolve:`, allFilenames);

        // 3. Create a lookup map for alt text from metadata.images
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

        // 4. Create imageInfos by combining found files and alt text lookup
        const imageInfos: { filename: string; alt: string }[] = allFilenames.map(filename => {
            const specificAlt = altTextMap.get(filename);
            const alt = specificAlt || generateAltText(filename) || metadata?.title || 'Memoir image';
            return { filename, alt };
        });
        console.log(`[${slug}] Image infos to resolve (combined):`, imageInfos);

        // 5. Resolve all image URLs
        const resolvedImages: (ImageInfo | null)[] = await Promise.all(
            imageInfos.map(async (info) => {
                const src = await resolveImageUrl(viteImportPathBase, info.filename);
                if (src) {
                    return { src, alt: info.alt, filename: info.filename };
                }
                console.warn(`[${slug}] Failed to resolve URL for filename: ${info.filename}`);
                return null;
            })
        );

        const allImages = resolvedImages.filter((img): img is ImageInfo => img !== null);
        console.log(`[${slug}] All resolved images (for lightbox):`, allImages);

        // 6. Separate Hero and Gallery images
        let heroImage: ImageInfo | null = null;
        let galleryImages: ImageInfo[] = [];

        if (allImages.length > 0) {
            if (metadata.heroImage) {
                heroImage = allImages.find(img => img.filename === metadata.heroImage) || null;
                if (heroImage) {
                    console.log(`[${slug}] Found specified hero image: ${metadata.heroImage}`);
                } else {
                    console.warn(`[${slug}] Specified hero image "${metadata.heroImage}" not found in resolved images. Falling back to first image if available.`);
                }
            }

            if (!heroImage && allImages.length > 0) {
                heroImage = allImages[0];
                console.log(`[${slug}] Using first available image as hero: ${heroImage.filename}`);
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
            heroImage: heroImage,
            galleryImages: galleryImages,
            allImages: allImages,
            contentHtml: contentHtml
        };

    } catch (err: any) {
        console.error(`[${slug}] Failed to load memoir page:`, err);
        error(500, `Failed to load memoir: ${slug}`);
    }
};