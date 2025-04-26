import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import pkg from 'yaml';
const { parse } = pkg;

// Define the expected shape of memoir metadata from info.md
interface MemoirMetadata {
    title: string;
    date: string;
    description?: string;
    coverImage?: string;
    images?: { filename: string; alt?: string }[];
    [key: string]: any;
}

// Define the shape of a single gallery preview item
interface GalleryPreview {
    src: string;
    alt: string;
}

// Define the shape of the memoir object for the landing page
interface MemoirSummary {
    slug: string;
    title: string;
    date: string;
    description?: string;
    galleryPreviews?: GalleryPreview[];
}

// Define the shape of the deeply grouped memoirs object
interface GroupedByDay {
    [day: number]: MemoirSummary[];
}
interface GroupedByMonth {
    [month: number]: GroupedByDay;
}
interface GroupedByYear {
    [year: number]: GroupedByMonth;
}

// Define the shape of the sorted keys object
interface SortedKeys {
    years: number[];
    months: { [year: number]: number[] };
    days: { [year: number]: { [month: number]: number[] } };
}

// Helper to read and parse frontmatter from info.md content
function parseMemoirInfo(content: string): MemoirMetadata | null {
    try {
        const parts = content.split('---');
        if (parts.length >= 3) {
            const frontmatter = parts[1]?.trim();
            if (frontmatter) {
                return parse(frontmatter) as MemoirMetadata;
            }
        }
    } catch (e) {
        console.error('Error parsing YAML frontmatter:', e);
    }
    return null;
}

// Pre-fetch all image modules using import.meta.glob, looking inside 'img' subdirectories
const allImageModules = import.meta.glob('/src/lib/assets/Memories/**/img/*.+(avif|gif|heif|jpeg|jpg|png|tiff|webp)', { eager: true });
// Import raw content of info.md files
const allInfoFiles = import.meta.glob('/src/lib/assets/Memories/*/info.md', { as: 'raw', eager: true });

// Helper to resolve image URLs safely using the pre-fetched modules
async function resolveImageUrl(
    baseImportPath: string, // e.g., /src/lib/assets/Memories/slug
    filename: string | null // e.g., img/image.jpg
): Promise<string | null> {
    if (!filename) return null;

    // Construct the full path key including the 'img' subdirectory if present in filename
    const imageImportPath = `${baseImportPath}/${filename}`;

    const imageModule = allImageModules[imageImportPath] as { default: string } | undefined;

    if (imageModule && imageModule.default) {
        return imageModule.default;
    } else {
        console.warn(`Could not find image module for "${imageImportPath}" via glob. Available keys nearby:`, Object.keys(allImageModules).filter(k => k.startsWith(baseImportPath)));
        // Attempt fallback without base path if filename already looks absolute (less likely needed with glob)
        const fallbackModule = allImageModules[filename] as { default: string } | undefined;
        if (fallbackModule && fallbackModule.default) {
            console.log(`Resolved using fallback key: ${filename}`);
            return fallbackModule.default;
        }
        console.warn(`Still could not resolve image: ${filename}`);
        return null;
    }
}

// Helper function to generate alt text from filename (removes 'img/' prefix if present)
function generateAltText(filename: string): string {
    if (!filename) return 'Image';
    const nameWithoutPrefix = filename.startsWith('img/') ? filename.substring(4) : filename;
    const nameWithoutExtension = nameWithoutPrefix.substring(0, nameWithoutPrefix.lastIndexOf('.')) || nameWithoutPrefix;
    return nameWithoutExtension
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

// Load function for the landing page /memories
export const load: PageServerLoad = async () => {
    const PREVIEW_IMAGE_LIMIT = 4; // Max previews per memoir on landing page

    let memoirSummaries: (MemoirSummary | null)[] = [];

    try {
        memoirSummaries = await Promise.all(
            Object.entries(allInfoFiles).map(async ([filePath, fileContent]) => {
                const slugMatch = filePath.match(/\/lib\/assets\/Memories\/([^/]+)\/info\.md$/);
                if (!slugMatch || !slugMatch[1]) {
                    console.warn(`Could not extract slug from path: ${filePath}`);
                    return null;
                }
                const slug = slugMatch[1];

                const metadata = parseMemoirInfo(fileContent);

                const viteImportPathBase = `/src/lib/assets/Memories/${slug}`;

                if (!metadata || !metadata.title || !metadata.date || isNaN(new Date(metadata.date).getTime())) {
                    console.warn(
                        `Skipping directory ${slug} due to missing/invalid title or date in info.md`
                    );
                    return null;
                }

                let potentialFilenames: string[] = [];
                if (metadata.images && metadata.images.length > 0) {
                    const coverFilename = metadata.coverImage;
                    let filenamesFromMeta = metadata.images.map(img => img.filename);

                    if (coverFilename && filenamesFromMeta.includes(coverFilename)) {
                        filenamesFromMeta = filenamesFromMeta.filter(f => f !== coverFilename);
                        filenamesFromMeta.unshift(coverFilename);
                    }
                    potentialFilenames = filenamesFromMeta.slice(0, PREVIEW_IMAGE_LIMIT);
                } else if (metadata.coverImage) {
                    potentialFilenames = [metadata.coverImage];
                    console.warn(`[${slug}] No 'images' array in info.md, using only coverImage for preview.`);
                } else {
                    console.warn(`[${slug}] No 'images' array or 'coverImage' in info.md. No previews will be generated.`);
                    potentialFilenames = [];
                }

                const altTextMap = new Map<string, string>();
                if (metadata.images && metadata.images.length > 0) {
                    metadata.images.forEach(img => {
                        if (img.filename && img.alt) {
                            altTextMap.set(img.filename, img.alt);
                        }
                    });
                }

                const galleryPreviewsPromises = potentialFilenames.map(async (filename) => {
                    const src = await resolveImageUrl(viteImportPathBase, filename);
                    if (src) {
                        const alt = altTextMap.get(filename) || generateAltText(filename);
                        return { src, alt };
                    }
                    console.warn(`[${slug}] Failed to resolve preview image URL for filename: ${filename}`);
                    return null;
                });

                const resolvedPreviews = await Promise.all(galleryPreviewsPromises);
                let finalPreviews = resolvedPreviews.filter((p): p is GalleryPreview => p !== null);

                if (metadata.coverImage && finalPreviews.length > 0) {
                    const coverIndex = finalPreviews.findIndex(p => p.src.includes(metadata.coverImage!)); // Check if src contains filename
                    if (coverIndex > 0) {
                        const coverPreview = finalPreviews.splice(coverIndex, 1)[0];
                        finalPreviews.unshift(coverPreview);
                    } else if (coverIndex === -1) {
                        const coverSrc = await resolveImageUrl(viteImportPathBase, metadata.coverImage);
                        if (coverSrc) {
                            const coverAlt = altTextMap.get(metadata.coverImage) || generateAltText(metadata.coverImage);
                            finalPreviews.unshift({ src: coverSrc, alt: coverAlt });
                            finalPreviews = finalPreviews.slice(0, PREVIEW_IMAGE_LIMIT);
                        } else {
                            console.warn(`[${slug}] Specified coverImage "${metadata.coverImage}" could not be resolved.`);
                        }
                    }
                }

                return {
                    slug,
                    title: metadata.title,
                    date: metadata.date,
                    description: metadata.description,
                    galleryPreviews: finalPreviews // Already sliced/ordered
                };

            })
        );

        const validMemoirs = memoirSummaries
            .filter((memoir): memoir is MemoirSummary => memoir !== null)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const groupedMemoirs: GroupedByYear = validMemoirs.reduce((acc, memoir) => {
            const date = new Date(memoir.date);
            const year = date.getFullYear();
            const month = date.getMonth(); // 0-indexed month
            const day = date.getDate();

            if (!acc[year]) {
                acc[year] = {};
            }
            if (!acc[year][month]) {
                acc[year][month] = {};
            }
            if (!acc[year][month][day]) {
                acc[year][month][day] = [];
            }
            acc[year][month][day].push(memoir);
            return acc;
        }, {} as GroupedByYear);

        // Create sorted keys for easier iteration in Svelte
        const sortedKeys: SortedKeys = {
            years: Object.keys(groupedMemoirs)
                .map(Number)
                .sort((a, b) => b - a), // Sort years descending
            months: {},
            days: {}
        };

        sortedKeys.years.forEach(year => {
            sortedKeys.months[year] = Object.keys(groupedMemoirs[year])
                .map(Number)
                .sort((a, b) => b - a); // Sort months descending
            sortedKeys.days[year] = {};
            sortedKeys.months[year].forEach(month => {
                sortedKeys.days[year][month] = Object.keys(groupedMemoirs[year][month])
                    .map(Number)
                    .sort((a, b) => b - a); // Sort days descending
            });
        });

        return {
            groupedMemoirs: groupedMemoirs,
            sortedKeys: sortedKeys
        };
    } catch (err) {
        console.error('Error loading memoirs:', err);
        error(500, 'Could not load memoirs');
    }
};