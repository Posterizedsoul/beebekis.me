import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { db } from '$lib/firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';

export const load: PageServerLoad = async ({ params }) => {
    const { slug } = params;

    try {
        const q = query(
            collection(db, 'projects'),
            where('slug', '==', slug),
            where('isPublished', '==', true),
            limit(1)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw error(404, `Project not found: ${slug}`);
        }

        const doc = querySnapshot.docs[0];
        const data = doc.data();

        // Content is already HTML from TipTap editor
        const contentHtml = data.content || '';

        // Get all images for gallery/fallback
        let images: { url: string; alt?: string }[] = [];
        const featuredImageBase = data.featuredImage ? data.featuredImage.split('?')[0] : '';

        if (data.images && Array.isArray(data.images)) {
            images = data.images
                .filter((img: any) => {
                    // Exclude the featured image from the gallery
                    const imgBase = img.url ? img.url.split('?')[0] : '';
                    return imgBase !== featuredImageBase;
                })
                .map((img: any) => ({
                    url: img.url,
                    alt: img.altText || 'Project image'
                }));
        }

        return {
            id: doc.id,
            metadata: {
                title: data.title,
                date: data.date?.toDate ? data.date.toDate().toISOString() : new Date(data.date).toISOString(),
                description: data.description,
                featuredImage: data.featuredImage,
                technologies: data.technologies || [],
                github: data.github,
                live: data.live
            },
            contentHtml,
            images
        };

    } catch (err: any) {
        console.error(`[Project Loader] Error loading project ${slug}:`, err);
        if (err.status === 404) throw err;
        throw error(500, `Failed to load project: ${slug}`);
    }
};

export const config = {
    isr: false
};
