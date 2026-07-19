<script lang="ts">
	import type { PageData } from './$types';
	import { fade, scale } from 'svelte/transition';
	import { onMount, onDestroy } from 'svelte';
	import { PUBLIC_BASE_URL } from '$env/static/public'; // Import base URL
	import { page } from '$app/state'; // Import page from $app/state
	import AdminEditButton from '$lib/components/AdminEditButton.svelte';
	// Import the enhanced image component type if needed for strict typing, otherwise it's globally available
	// import type { EnhancedImg } from '@sveltejs/enhanced-img';

	export let data: PageData;

	// Types for remote image data from Firestore
	interface RemoteImageInfo {
		url: string;
		altText?: string;
		filename: string;
	}

	// Use the FULL images array from loaded data for lightbox
	// The loader returns 'images' which replaces 'allImages'
	const allImages: RemoteImageInfo[] = data.images || [];

	// Separate gallery images for masonry
	// For now, let's just use all images except hero if possible, or just all images
	// The loader logic in +page.server.ts needs to be checked if it separates them.
	// Assuming data.images contains all images.

	const heroImage: string | null = data.heroImage; // URL string
	const coverImage: string | null = data.coverImage; // URL string

	// Filter out hero image from gallery if needed, or just show all
	const galleryImages = allImages;

	// Construct URLs and descriptions for meta tags
	const baseUrl = PUBLIC_BASE_URL || 'https://bibekbhatta.com'; // Use env variable or fallback
	const memoryUrl = `${baseUrl}${page.url.pathname}`;
	const memoryDescription = data.description || `A gallery of memories: ${data.title}`;
	const memoryImageUrl = heroImage || coverImage || `${baseUrl}/b.png`;

	import ImageLightbox from '$lib/components/ImageLightbox.svelte';

	// Lightbox state
	let lightboxOpen = false;
	let selectedImageIndex = 0;

	// Prepare images for ImageLightbox format
	$: lightboxImages = allImages.map((img) => ({
		url: img.url,
		alt: img.altText || '',
		caption: img.altText || ''
	}));

	function openLightbox(imageInfo: RemoteImageInfo, indexInFullArray: number) {
		if (indexInFullArray < 0 || indexInFullArray >= allImages.length) return;
		selectedImageIndex = indexInFullArray;
		lightboxOpen = true;
	}

	function closeLightbox() {
		lightboxOpen = false;
	}

	function formatDate(dateString: string): string {
		if (!dateString) return '';
		try {
			return new Date(dateString).toLocaleDateString('en-US', {
				day: 'numeric',
				month: 'long',
				year: 'numeric'
			});
		} catch (e) {
			return 'Invalid Date';
		}
	}
</script>


<svelte:head>
	<title>{data.title || 'Memoir Gallery'}</title>
	<meta name="description" content={memoryDescription} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="article" />
	<meta property="og:url" content={memoryUrl} />
	<meta property="og:title" content={data.title || 'Memoir Gallery'} />
	<meta property="og:description" content={memoryDescription} />
	<meta property="og:image" content={memoryImageUrl} />
	{#if data.date}
		<meta property="article:published_time" content={new Date(data.date).toISOString()} />
	{/if}

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={memoryUrl} />
	<meta property="twitter:title" content={data.title || 'Memoir Gallery'} />
	<meta property="twitter:description" content={memoryDescription} />
	<meta property="twitter:image" content={memoryImageUrl} />

	<link rel="canonical" href={memoryUrl} />
</svelte:head>

<!-- Hero Section -->
<section class="hero-section relative mb-10 bg-gray-200 md:mb-16">
	{#if heroImage}
		<img
			src={heroImage}
			alt={data.title || 'Hero image'}
			class="block h-[60vh] w-full object-cover md:h-[70vh]"
			loading="eager"
		/>
		<div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
		<header class="absolute right-0 bottom-0 left-0 z-10 p-6 text-white md:p-10">
			<h1 class="text-shadow mb-2 text-3xl font-bold md:text-5xl">{data.title}</h1>
			{#if data.date}
				<p class="text-md text-shadow text-gray-200 md:text-lg">{formatDate(data.date)}</p>
			{/if}
			{#if data.description}
				<p class="text-shadow mt-3 max-w-3xl text-lg text-gray-100 md:mt-4 md:text-xl">
					{data.description}
				</p>
			{/if}
			<!-- Simplified button: just scrolls to gallery since hero isn't in array usually in this new model 
                 OR if we want to lightbox it, we'd need it in the array. 
                 For simplicity, let's just View Gallery. -->
		</header>
	{:else}
		<header class="px-4 py-16 text-center">
			<h1 class="mb-2 text-3xl font-semibold text-gray-900 md:text-4xl">{data.title}</h1>
			{#if data.date}
				<p class="text-md text-gray-600">{formatDate(data.date)}</p>
			{/if}
			{#if data.description}
				<p class="mx-auto mt-4 max-w-3xl text-lg text-gray-700">{data.description}</p>
			{/if}
		</header>
	{/if}
</section>

<!-- Main Content Area (Gallery + Text) -->
<section class="memories-container mx-auto w-full max-w-[100rem] px-4 pb-8 md:px-8 xl:px-12 md:pb-16">
	{#if data.contentHtml}
		<div class="prose lg:prose-xl mx-auto mb-10 max-w-4xl md:mb-16">
			{@html data.contentHtml}
		</div>
	{/if}

	{#if galleryImages.length > 0}
		<h2 class="mb-6 text-2xl font-semibold text-gray-700">Gallery</h2>
		<div class="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
			{#each galleryImages as imageInfo, index (imageInfo.url)}
				<!-- Generate a pseudo-random but consistent aspect ratio based on the image URL -->
				{@const hash = imageInfo.url.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)}
				{@const ratios = ['aspect-[4/3]', 'aspect-[3/4]', 'aspect-square', 'aspect-auto', 'aspect-[4/5]', 'aspect-[5/4]', 'aspect-[2/3]']}
				{@const ratio = ratios[hash % ratios.length]}
				
				<div
					class="break-inside-avoid mb-4 relative block cursor-pointer overflow-hidden rounded-xl shadow-sm transition-shadow hover:shadow-md {ratio}"
					on:click={() => openLightbox(imageInfo, index)}
					role="button"
					tabindex="0"
					title={imageInfo.altText || 'View larger image'}
					on:keydown={(e) => e.key === 'Enter' && openLightbox(imageInfo, index)}
				>
					<img
						src={imageInfo.url}
						alt={imageInfo.altText || 'Gallery image'}
						loading="lazy" decoding="async"
						class="block w-full object-cover {ratio === 'aspect-auto' ? 'h-auto' : 'h-full'}"
					/>
				</div>
			{/each}
		</div>
	{:else if !heroImage}
		<p class="text-center text-gray-500">No images found in this memoir.</p>
	{/if}
</section>

<!-- Lightbox Modal -->
{#if lightboxOpen}
	<ImageLightbox
		images={lightboxImages}
		startIndex={selectedImageIndex}
		onClose={closeLightbox}
	/>
{/if}

<!-- Edit button for logged-in users -->
<AdminEditButton kind="memory" docId={data.id} label="Edit Memory" />

<style>
	/* ...existing styles... */



	/* Ensure spacing below the main container */
	.memories-container {
		min-height: 50vh;
	}
</style>
