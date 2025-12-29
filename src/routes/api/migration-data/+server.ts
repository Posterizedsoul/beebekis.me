import { json } from '@sveltejs/kit';
import yaml from 'js-yaml';

export const GET = async () => {
    // Helper to parse Markdown/YAML files manually
    const parseFileContent = (raw: string) => {
        // Try to match standard frontmatter block
        const matches = raw.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
        if (matches) {
            try {
                return {
                    metadata: yaml.load(matches[1]) as any,
                    content: matches[2].trim()
                };
            } catch (e) {
                console.error('YAML load error in block matching:', e);
            }
        }

        // Fallback for files that might be JUST yaml (like info.md) or malformed
        try {
            // Split by --- and take the first non-empty part if it looks like YAML
            const parts = raw.split(/^---$/m).filter(p => p.trim());
            if (parts.length > 0) {
                return {
                    metadata: yaml.load(parts[0]) as any,
                    content: parts.slice(1).join('\n---\n').trim()
                };
            }
        } catch (e) {
            console.error('YAML load error in fallback:', e);
        }

        return { metadata: {}, content: raw };
    };

    // 1. Memories
    const memoryFiles = import.meta.glob('/src/lib/assets/Memories/*/info.md', { query: '?raw', import: 'default', eager: true });
    const memoryImages = import.meta.glob('/src/lib/assets/Memories/**/*.{jpg,jpeg,png,webp,avif,gif}', { query: '?url', import: 'default', eager: true });

    const memories = Object.entries(memoryFiles).map(([path, content]) => {
        const slug = path.split('/').slice(-2)[0];
        const { metadata } = parseFileContent(content as string);

        const relatedImages = Object.keys(memoryImages)
            .filter(img => img.includes(`/Memories/${slug}/`))
            .map(img => ({
                path: img,
                url: memoryImages[img] as string,
                filename: img.split('/').pop()
            }));

        return {
            type: 'memory',
            slug,
            ...metadata,
            localImages: relatedImages
        };
    });

    // 2. Diary
    const diaryFiles = import.meta.glob('/src/lib/diary/*/+page.md', { query: '?raw', import: 'default', eager: true });
    const diaryImages = import.meta.glob('/src/lib/diary/**/*.{jpg,jpeg,png,webp,avif,gif}', { query: '?url', import: 'default', eager: true });

    const diaryEntries = Object.entries(diaryFiles).map(([path, rawContent]) => {
        const slug = path.split('/').slice(-2)[0];
        const { metadata, content } = parseFileContent(rawContent as string);

        const relatedImages = Object.keys(diaryImages)
            .filter(img => img.includes(`/diary/${slug}/`))
            .map(img => ({
                path: img,
                url: diaryImages[img] as string,
                filename: img.split('/').pop()
            }));

        return {
            type: 'diary',
            slug,
            ...metadata,
            content,
            localImages: relatedImages
        };
    });

    // 3. Blog
    const blogFiles = import.meta.glob('/src/lib/posts/**/+page.md', { query: '?raw', import: 'default', eager: true });
    const blogImages = import.meta.glob('/src/lib/posts/**/*.{jpg,jpeg,png,webp,avif,gif}', { query: '?url', import: 'default', eager: true });

    const blogPosts = Object.entries(blogFiles).map(([path, rawContent]) => {
        const pathParts = path.split('/');
        const slug = pathParts[pathParts.length - 2];
        const { metadata, content } = parseFileContent(rawContent as string);

        const postDir = path.substring(0, path.lastIndexOf('/'));

        const relatedImages = Object.keys(blogImages)
            .filter(img => img.startsWith(postDir))
            .map(img => ({
                path: img,
                url: blogImages[img] as string,
                filename: img.split('/').pop()
            }));

        return {
            type: 'blog',
            slug,
            ...metadata,
            content,
            localImages: relatedImages
        };
    });

    return json({
        memories,
        diaryEntries,
        blogPosts
    });
};
