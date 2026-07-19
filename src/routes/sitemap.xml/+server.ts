import type { RequestHandler } from './$types';
import { db } from '$lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { PUBLIC_BASE_URL } from '$env/static/public';

const BASE = (PUBLIC_BASE_URL || 'https://bibekbhatta.com').replace(/\/$/, '');

// Diary and memories are intentionally excluded — only the professional
// content (projects, blog) should surface in search.
const STATIC_ROUTES = [
	{ path: '/', priority: '1.0', changefreq: 'monthly' },
	{ path: '/about', priority: '0.9', changefreq: 'monthly' },
	{ path: '/projects', priority: '0.9', changefreq: 'weekly' },
	{ path: '/blog', priority: '0.8', changefreq: 'weekly' }
];

async function publishedSlugs(
	collectionName: string
): Promise<{ slug: string; lastmod?: string }[]> {
	try {
		const snap = await getDocs(
			query(collection(db, collectionName), where('isPublished', '==', true))
		);
		return snap.docs
			.map((d) => {
				const data = d.data();
				const updated = data.updatedAt?.toDate?.() ?? data.date?.toDate?.();
				return {
					slug: data.slug as string,
					lastmod: updated ? updated.toISOString().split('T')[0] : undefined
				};
			})
			.filter((e) => !!e.slug);
	} catch (err) {
		console.error(`Sitemap: failed to load ${collectionName}:`, err);
		return [];
	}
}

function urlEntry(loc: string, opts: { priority?: string; changefreq?: string; lastmod?: string }) {
	return `	<url>
		<loc>${loc}</loc>${opts.lastmod ? `\n\t\t<lastmod>${opts.lastmod}</lastmod>` : ''}${
			opts.changefreq ? `\n\t\t<changefreq>${opts.changefreq}</changefreq>` : ''
		}${opts.priority ? `\n\t\t<priority>${opts.priority}</priority>` : ''}
	</url>`;
}

export const GET: RequestHandler = async () => {
	const [projects, posts] = await Promise.all([
		publishedSlugs('projects'),
		publishedSlugs('blog_posts')
	]);

	const urls = [
		...STATIC_ROUTES.map((r) => urlEntry(`${BASE}${r.path}`, r)),
		...projects.map((p) =>
			urlEntry(`${BASE}/projects/${p.slug}`, {
				priority: '0.8',
				changefreq: 'monthly',
				lastmod: p.lastmod
			})
		),
		...posts.map((p) =>
			urlEntry(`${BASE}/blog/${p.slug}`, {
				priority: '0.7',
				changefreq: 'monthly',
				lastmod: p.lastmod
			})
		)
	];

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
