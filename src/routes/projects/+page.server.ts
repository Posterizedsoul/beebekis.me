import type { PageServerLoad } from './$types';
import { db } from '$lib/firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';

interface Project {
    id: string;
    slug: string;
    title: string;
    date: string;
    description?: string;
    featuredImage?: string;
    technologies?: string[];
    github?: string;
    live?: string;
    images?: { url: string; alt?: string; filename?: string }[];
}

interface GroupedByYear {
    [year: number]: Project[];
}

export const load: PageServerLoad = async () => {
    try {
        console.log('Loading projects from Firestore...');

        const q = query(
            collection(db, 'projects'),
            where('isPublished', '==', true),
            orderBy('date', 'desc')
        );

        const querySnapshot = await getDocs(q);

        const projects: Project[] = querySnapshot.docs.map(doc => {
            const data = doc.data();
            const dateObj = data.date?.toDate ? data.date.toDate() : new Date(data.date);

            // Get preview images (first 5)
            let galleryPreviews: { src: string; alt: string; filename: string }[] = [];
            if (data.images && Array.isArray(data.images)) {
                galleryPreviews = data.images.slice(0, 5).map((img: any) => ({
                    src: img.url,
                    alt: img.altText || 'Project image',
                    filename: img.filename || 'image'
                }));
            }

            return {
                id: doc.id,
                slug: data.slug,
                title: data.title,
                date: dateObj.toISOString(),
                description: data.description,
                featuredImage: data.featuredImage,
                technologies: data.technologies || [],
                github: data.github,
                live: data.live,
                galleryPreviews
            };
        });

        // Group projects by year
        const groupedProjects: GroupedByYear = projects.reduce((acc, project) => {
            const year = new Date(project.date).getFullYear();
            if (!acc[year]) {
                acc[year] = [];
            }
            acc[year].push(project);
            return acc;
        }, {} as GroupedByYear);

        const sortedYears = Object.keys(groupedProjects).map(Number).sort((a, b) => b - a);

        return {
            projects,
            groupedProjects,
            sortedYears
        };

    } catch (err: any) {
        console.error('Failed to load projects:', err);
        return {
            projects: [],
            groupedProjects: {},
            sortedYears: []
        };
    }
};

export const config = {
    isr: false
};
