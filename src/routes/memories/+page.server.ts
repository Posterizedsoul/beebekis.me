import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import path from 'path';
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
        const frontmatterMatch = content.match(/---\s*([\s\S]*?)\s*---/);
        if (frontmatterMatch && frontmatterMatch[1]) {
            return parse(frontmatterMatch[1]) as MemoirMetadata;
        }
        return null;
    } catch (e) {
        console.warn(`Could not parse frontmatter:`, e);
        return null;
    }
}

// Helper to find image files in a directory (returns filenames only)
import fs from 'fs/promises';
async function findImageFilenames(dirPath: string, limit: number = Infinity): Promise<string[]> {
    try {
        const resolvedDirPath = path.resolve(dirPath);
        const files = await fs.readdir(resolvedDirPath);
        const imageFiles = files.filter((file) =>
            /\.(avif|gif|heif|jpeg|jpg|png|tiff|webp)$/i.test(file)
        );
        return imageFiles.slice(0, limit);
    } catch (e) {
        console.warn(`Could not read directory or find images in ${dirPath} (resolved: ${path.resolve(dirPath)}):`, e);
        return [];
    }
}

// Pre-fetch all image modules using import.meta.glob
const allImageModules = import.meta.glob('/src/lib/assets/Memories/**/*.+(avif|gif|heif|jpeg|jpg|png|tiff|webp)', { eager: true });

// Helper to resolve image URLs safely using the pre-fetched modules
async function resolveImageUrl(
    baseImportPath: string,
    filename: string | null
): Promise<string | null> {
    if (!filename) return null;

    const imageImportPath = `${baseImportPath}/${filename}`;

    const imageModule = allImageModules[imageImportPath] as { default: string } | undefined;

    if (imageModule && imageModule.default) {
        return imageModule.default;
    } else {
        console.warn(`Could not find image module for "${imageImportPath}" via glob. Available keys nearby:`, Object.keys(allImageModules).filter(k => k.startsWith(baseImportPath)));
        return null;
    }
}

// Helper function to generate alt text from filename
function generateAltText(filename: string): string {
    let name = filename.substring(0, filename.lastIndexOf('.')) || filename;
    name = name.replace(/[_-]/g, ' ');
    name = name.replace(/\b\w/g, char => char.toUpperCase());
    return name.trim();
}

// Load function for the landing page /memories
export const load: PageServerLoad = async () => {
    const PREVIEW_IMAGE_LIMIT = 4;
    let memoirSummaries: (MemoirSummary | null)[] = [];

    try {
        const memoirInfoFiles = import.meta.glob('/src/lib/assets/Memories/*/info.md', { as: 'raw' });

        memoirSummaries = await Promise.all(
            Object.entries(memoirInfoFiles).map(async ([filePath, contentResolver]) => {
                const slugMatch = filePath.match(/\/lib\/assets\/Memories\/([^/]+)\/info\.md$/);
                if (!slugMatch || !slugMatch[1]) {
                    console.warn(`Could not extract slug from path: ${filePath}`);
                    return null;
                }
                const slug = slugMatch[1];

                const fileContent = await contentResolver();
                const metadata = parseMemoirInfo(fileContent);

                const viteImportPathBase = `/src/lib/assets/Memories/${slug}`;
                const fullDirPath = path.join('src/lib/assets/Memories', slug);

                if (!metadata || !metadata.title || !metadata.date || isNaN(new Date(metadata.date).getTime())) {
                    console.warn(
                        `Skipping directory ${slug} due to missing/invalid title or date in info.md`
                    );
                    return null;
                }

                let potentialFilenames: string[] = [];
                if (metadata.images && metadata.images.length > 0) {
                    potentialFilenames = metadata.images.map(img => img.filename).slice(0, PREVIEW_IMAGE_LIMIT);
                } else {
                    console.warn(`[${slug}] No 'images' array in info.md, falling back to reading directory (may fail in deployment).`);
                    potentialFilenames = await findImageFilenames(fullDirPath, PREVIEW_IMAGE_LIMIT);
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
                const galleryPreviews = resolvedPreviews.filter((p): p is GalleryPreview => p !== null);

                let finalPreviews = galleryPreviews;
                if (metadata.coverImage) {
                    const coverIndex = finalPreviews.findIndex(p => p.src.endsWith(metadata.coverImage!));
                    if (coverIndex > 0) {
                        const coverPreview = finalPreviews.splice(coverIndex, 1)[0];
                        finalPreviews.unshift(coverPreview);
                    } else if (coverIndex === -1) {
                        const coverSrc = await resolveImageUrl(viteImportPathBase, metadata.coverImage);
                        if (coverSrc) {
                            const coverAlt = altTextMap.get(metadata.coverImage) || generateAltText(metadata.coverImage);
                            finalPreviews.unshift({ src: coverSrc, alt: coverAlt });
                        } else {
                            console.warn(`[${slug}] Specified coverImage "${metadata.coverImage}" could not be resolved.`);
                        }
                    }
                }
                finalPreviews = finalPreviews.slice(0, PREVIEW_IMAGE_LIMIT);

                return {
                    slug,
                    title: metadata.title,
                    date: metadata.date,
                    description: metadata.description,
                    galleryPreviews: finalPreviews
                };

            })
        );

        const validMemoirs = memoirSummaries
            .filter((memoir): memoir is MemoirSummary => memoir !== null)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const groupedMemoirs: GroupedByYear = validMemoirs.reduce((acc, memoir) => {
            const date = new Date(memoir.date);
            const year = date.getFullYear();
            const month = date.getMonth();
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

        const sortedKeys: SortedKeys = { years: [], months: {}, days: {} };

        sortedKeys.years = Object.keys(groupedMemoirs).map(Number).sort((a, b) => b - a);

        for (const year of sortedKeys.years) {
            sortedKeys.months[year] = Object.keys(groupedMemoirs[year]).map(Number).sort((a, b) => b - a);
            sortedKeys.days[year] = {};
            for (const month of sortedKeys.months[year]) {
                sortedKeys.days[year][month] = Object.keys(groupedMemoirs[year][month]).map(Number).sort((a, b) => b - a);
            }
        }

        return {
            groupedMemoirs: groupedMemoirs,
            sortedKeys: sortedKeys
        };
    } catch (err) {
        console.error('Error loading memoirs:', err);
        error(500, 'Could not load memoirs');
    }
};