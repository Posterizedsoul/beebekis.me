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
	const baseUrl = PUBLIC_BASE_URL || 'https://www.beebekis.me'; // Use env variable or fallback
	const memoryUrl = `${baseUrl}${page.url.pathname}`;
	const memoryDescription = data.description || `A gallery of memories: ${data.title}`;
	const memoryImageUrl = heroImage || coverImage || `${baseUrl}/b.png`;

	// Lightbox state
	let lightboxOpen = false;
	let selectedImageInfo: RemoteImageInfo | null = null;
	let selectedImageIndex = -1;

	// Virtualized thumbnail window size (show 5 before + current + 5 after)
	const THUMB_WINDOW_SIZE = 5;

	// Computed visible thumbnails for virtualization
	$: visibleThumbnails = (() => {
		if (selectedImageIndex < 0 || allImages.length === 0) return [];

		const start = Math.max(0, selectedImageIndex - THUMB_WINDOW_SIZE);
		const end = Math.min(allImages.length, selectedImageIndex + THUMB_WINDOW_SIZE + 1);

		return allImages.slice(start, end).map((img, i) => ({
			...img,
			originalIndex: start + i
		}));
	})();

	// Check if there are hidden images on either side
	$: hasMoreBefore = selectedImageIndex > THUMB_WINDOW_SIZE;
	$: hasMoreAfter = selectedImageIndex < allImages.length - THUMB_WINDOW_SIZE - 1;

	// --- Preload Cache ---
	let preloadedImages = new Map<
		string,
		{ status: 'loading' | 'loaded' | 'error'; element?: HTMLImageElement }
	>();

	function preloadImage(src: string) {
		if (!src || preloadedImages.has(src)) return;

		const img = new Image();
		preloadedImages.set(src, { status: 'loading', element: img });

		img.onload = () => {
			preloadedImages.set(src, { status: 'loaded', element: img });
		};
		img.onerror = () => {
			preloadedImages.set(src, { status: 'error' });
		};
		img.src = src;
	}

	function openLightbox(imageInfo: RemoteImageInfo, indexInFullArray: number) {
		if (indexInFullArray < 0 || indexInFullArray >= allImages.length) return;

		selectedImageInfo = imageInfo;
		selectedImageIndex = indexInFullArray;
		lightboxOpen = true;

		// Preload next/prev
		if (allImages.length > 1) {
			const nextIndex = (indexInFullArray + 1) % allImages.length;
			const prevIndex = (indexInFullArray - 1 + allImages.length) % allImages.length;
			preloadImage(allImages[nextIndex].url);
			if (nextIndex !== prevIndex) {
				preloadImage(allImages[prevIndex].url);
			}
		}
		preloadImage(imageInfo.url);
	}

	function closeLightbox() {
		lightboxOpen = false;
		selectedImageInfo = null;
		selectedImageIndex = -1;
	}

	// Simplified instant navigation - no animations
	function goToImage(targetIndex: number) {
		if (targetIndex < 0 || targetIndex >= allImages.length) return;
		if (targetIndex === selectedImageIndex) return;

		// Instant swap
		selectedImageIndex = targetIndex;
		selectedImageInfo = allImages[targetIndex];

		// Preload adjacent images
		const nextIdx = (targetIndex + 1) % allImages.length;
		const prevIdx = (targetIndex - 1 + allImages.length) % allImages.length;
		preloadImage(allImages[nextIdx].url);
		if (nextIdx !== prevIdx) {
			preloadImage(allImages[prevIdx].url);
		}
	}

	// --- Navigation functions ---
	function goToNextImage() {
		if (!lightboxOpen || allImages.length <= 1) return;
		const nextIndex = (selectedImageIndex + 1) % allImages.length;
		goToImage(nextIndex);
	}

	function goToPrevImage() {
		if (!lightboxOpen || allImages.length <= 1) return;
		const prevIndex = (selectedImageIndex - 1 + allImages.length) % allImages.length;
		goToImage(prevIndex);
	}

	function jumpToImage(targetIndex: number) {
		goToImage(targetIndex);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (lightboxOpen) {
			if (event.key === 'Escape') closeLightbox();
			else if (event.key === 'ArrowRight') goToNextImage();
			else if (event.key === 'ArrowLeft') goToPrevImage();
		}
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

<svelte:window on:keydown={handleKeydown} />

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
		<header class="absolute bottom-0 left-0 right-0 z-10 p-6 text-white md:p-10">
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
<section class="memories-container mx-auto max-w-6xl px-4 pb-8 md:pb-16">
	{#if data.contentHtml}
		<div class="prose lg:prose-xl mb-10 max-w-none md:mb-16">
			{@html data.contentHtml}
		</div>
	{/if}

	{#if galleryImages.length > 0}
		<h2 class="mb-6 text-2xl font-semibold text-gray-700">Gallery</h2>
		<div class="image-gallery">
			{#each galleryImages as imageInfo, index (imageInfo.filename)}
				<div
					class="gallery-item"
					on:click={() => openLightbox(imageInfo, index)}
					role="button"
					tabindex="0"
					title={imageInfo.altText || 'View larger image'}
					on:keydown={(e) => e.key === 'Enter' && openLightbox(imageInfo, index)}
				>
					<img
						src={imageInfo.url}
						alt={imageInfo.altText || 'Gallery image'}
						loading="lazy"
						class="gallery-image-enhanced"
					/>
				</div>
			{/each}
		</div>
	{:else if !heroImage}
		<p class="text-center text-gray-500">No images found in this memoir.</p>
	{/if}
</section>

<!-- Lightbox Modal -->
{#if lightboxOpen && selectedImageInfo}
	{@const _ = console.log(
		`Rendering Lightbox. Index: ${selectedImageIndex}, Filename: ${selectedImageInfo.filename}`
	)}
	<div
		class="lightbox-overlay"
		on:click={closeLightbox}
		role="dialog"
		aria-modal="true"
		aria-label="Image Lightbox"
		tabindex="-1"
	>
		<!-- Main area for image and nav buttons -->
		<div class="lightbox-main-area">
			{#if allImages.length > 1}
				<button
					class="lightbox-nav prev"
					on:click|stopPropagation={goToPrevImage}
					aria-label="Previous image"
				>
					&#10094;
				</button>
			{/if}

			<div class="lightbox-content" on:click|stopPropagation role="presentation">
				<div class="lightbox-image-wrapper">
					<!-- Simple instant image swap, no transitions -->
					<img
						src={selectedImageInfo.url}
						alt={selectedImageInfo.altText || 'Image'}
						loading="eager"
						class="lightbox-image"
					/>
				</div>
				<!-- Caption moved outside the key block -->
				{#if selectedImageInfo.altText}
					<div class="lightbox-caption">{selectedImageInfo.altText}</div>
				{/if}
			</div>

			{#if allImages.length > 1}
				<button
					class="lightbox-nav next"
					on:click|stopPropagation={goToNextImage}
					aria-label="Next image"
				>
					&#10095;
				</button>
			{/if}
		</div>

		<!-- Virtualized thumbnail strip - only renders visible window -->
		{#if allImages.length > 1}
			<div class="thumbnail-strip">
				<!-- Indicator for more images before -->
				{#if hasMoreBefore}
					<button
						class="more-indicator"
						title="Jump back 5 images"
						on:click|stopPropagation={() =>
							jumpToImage(Math.max(0, selectedImageIndex - THUMB_WINDOW_SIZE))}
					>
						<span>◀◀</span>
					</button>
				{/if}

				{#each visibleThumbnails as thumbItem (thumbItem.filename)}
					<div
						class="thumbnail-item"
						class:active={thumbItem.originalIndex === selectedImageIndex}
						on:click|stopPropagation={() => jumpToImage(thumbItem.originalIndex)}
						role="button"
						tabindex="0"
						aria-label={`View image ${thumbItem.originalIndex + 1}`}
						title={thumbItem.altText || `Image ${thumbItem.originalIndex + 1}`}
						on:keydown={(e) => e.key === 'Enter' && jumpToImage(thumbItem.originalIndex)}
					>
						<img
							src={thumbItem.url}
							alt={thumbItem.altText || `Thumbnail ${thumbItem.originalIndex + 1}`}
							loading="lazy"
							class="thumbnail-image"
						/>
					</div>
				{/each}

				<!-- Indicator for more images after -->
				{#if hasMoreAfter}
					<button
						class="more-indicator"
						title="Jump forward 5 images"
						on:click|stopPropagation={() =>
							jumpToImage(Math.min(allImages.length - 1, selectedImageIndex + THUMB_WINDOW_SIZE))}
					>
						<span>▶▶</span>
					</button>
				{/if}
			</div>
		{/if}
	</div>
{/if}

<!-- Edit button for logged-in users -->
<AdminEditButton href="/admin/memories/{data.id}" label="Edit Memory" />

<style>
	/* ...existing styles... */

	/* --- Masonry Gallery Styles --- */
	.image-gallery {
		column-count: 1;
		column-gap: 1rem;
	}
	@media (min-width: 640px) {
		.image-gallery {
			column-count: 2;
		}
	}
	@media (min-width: 1024px) {
		.image-gallery {
			column-count: 3;
		}
	}

	.gallery-item {
		break-inside: avoid;
		margin-bottom: 1rem;
		display: block;
		cursor: pointer;
		border-radius: 12px;
		overflow: hidden;
		position: relative;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
		transition: box-shadow 0.2s ease;
	}
	.gallery-item:hover {
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
	}

	/* Style the image generated by enhanced:img within gallery items */
	.gallery-item :global(img.gallery-image-enhanced) {
		display: block;
		width: 100%;
		height: auto;
		object-fit: cover;
	}

	/* --- Lightbox Styles --- */
	.lightbox-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.85); /* Slightly darker */
		display: flex;
		flex-direction: column; /* Arrange main area and thumbnails vertically */
		align-items: center;
		justify-content: center; /* Center main area vertically */
		z-index: 1000;
		padding-bottom: 80px; /* Add padding at the bottom for thumbnails */
		box-sizing: border-box;
	}

	.lightbox-main-area {
		position: relative;
		max-width: 95%; /* Allow slightly more width */
		width: 100%;
		/* Remove margin: 0 auto; as flex handles centering */
		display: flex; /* Use flex to center content */
		align-items: center;
		justify-content: center;
		flex-grow: 1; /* Allow main area to take available space */
		max-height: calc(100% - 20px); /* Ensure it doesn't overlap bottom padding too much */
	}

	.lightbox-nav {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		background: rgba(0, 0, 0, 0.3); /* Add slight background */
		border: none;
		color: white;
		font-size: 2rem;
		cursor: pointer;
		padding: 0.75rem 0.5rem; /* Adjust padding */
		z-index: 1001;
		border-radius: 4px;
		transition: background 0.2s ease;
	}
	.lightbox-nav:hover {
		background: rgba(0, 0, 0, 0.5);
	}
	.lightbox-nav.prev {
		left: 10px;
	} /* Adjust position */
	.lightbox-nav.next {
		right: 10px;
	} /* Adjust position */
	.lightbox-nav:disabled {
		opacity: 0.5;
		cursor: default;
	}

	.lightbox-content {
		position: relative;
		width: auto; /* Let width be determined by content */
		max-width: 100%;
		display: flex; /* Use flex for image and caption */
		flex-direction: column;
		align-items: center;
	}

	.loading-indicator {
		position: absolute; /* Position over the image area */
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: white;
		background: rgba(0, 0, 0, 0.6);
		padding: 0.5rem 1rem;
		border-radius: 4px;
		z-index: 1; /* Ensure it's above the image wrapper during load */
	}

	.lightbox-caption {
		color: #eee;
		text-align: center;
		margin-top: 0.75rem; /* Space between image and caption */
		font-size: 0.9rem;
		padding: 0 1rem; /* Add some horizontal padding */
		max-width: 80%; /* Prevent caption from being too wide */
		line-height: 1.4;
	}

	.thumbnail-strip {
		position: fixed; /* Position fixed at the bottom */
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		overflow-x: auto;
		gap: 0.5rem;
		padding: 10px 15px; /* Add padding */
		background: rgba(0, 0, 0, 0.6); /* Add background for contrast */
		z-index: 1001;
		justify-content: center; /* Center thumbnails if they don't fill the width */
		box-sizing: border-box;
		/* Add scrollbar styling if desired */
		scrollbar-width: thin;
		scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
	}
	.thumbnail-strip::-webkit-scrollbar {
		height: 8px;
	}
	.thumbnail-strip::-webkit-scrollbar-track {
		background: transparent;
	}
	.thumbnail-strip::-webkit-scrollbar-thumb {
		background-color: rgba(255, 255, 255, 0.3);
		border-radius: 10px;
		border: 2px solid transparent;
		background-clip: content-box;
	}

	.thumbnail-strip .thumbnail-item {
		flex: 0 0 auto;
		height: 50px; /* Ensure container has height */
		width: 50px; /* Ensure container has width */
		border-radius: 3px; /* Apply border-radius to container */
		overflow: hidden; /* Hide overflow from image */
		cursor: pointer;
		border: 2px solid transparent; /* Add border for active state */
		transition: border-color 0.2s ease;
	}

	.lightbox-image-wrapper {
		will-change: transform, opacity;
		transform: translateZ(0); /* Force GPU acceleration */
		backface-visibility: hidden;
		display: flex;
		justify-content: center;
		align-items: center;
		/* Adjust max-height calculation based on thumbnail strip height and padding */
		max-height: calc(100vh - 120px); /* e.g., 80px for strip + 40px breathing room */
		width: 100%; /* Ensure wrapper takes width */
	}

	/* Style the lightbox image */
	.lightbox-image-wrapper .lightbox-image {
		display: block;
		max-width: 100%;
		/* Use max-height from wrapper */
		max-height: calc(100vh - 120px);
		width: auto;
		height: auto;
		object-fit: contain;
		border-radius: 3px;
		box-shadow: 0 5px 20px rgba(0, 0, 0, 0.4);
	}

	/* Style thumbnail images */
	.thumbnail-item .thumbnail-image {
		display: block;
		height: 100%; /* Fill container */
		width: 100%; /* Fill container */
		object-fit: cover;
		opacity: 0.6;
		transition: opacity 0.2s ease;
	}

	.thumbnail-item:hover .thumbnail-image {
		opacity: 1; /* Full opacity on hover */
	}
	.thumbnail-item.active {
		border-color: white; /* Use border instead of shadow */
	}
	.thumbnail-item.active .thumbnail-image {
		opacity: 1;
		/* box-shadow: 0 0 0 2px white; */ /* Replaced by border */
	}

	.text-shadow {
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
	}

	/* More indicator for virtualized thumbnails */
	.more-indicator {
		flex: 0 0 auto;
		height: 50px;
		width: 50px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: rgba(255, 255, 255, 0.9);
		font-size: 14px;
		letter-spacing: 1px;
		cursor: pointer;
		background: rgba(255, 255, 255, 0.15);
		border: none;
		border-radius: 4px;
		transition: all 0.2s ease;
		animation: pulse-glow 1.5s ease-in-out infinite;
	}

	.more-indicator:hover {
		color: white;
		background: rgba(255, 255, 255, 0.3);
		transform: scale(1.05);
	}

	@keyframes pulse-glow {
		0%,
		100% {
			opacity: 0.7;
		}
		50% {
			opacity: 1;
		}
	}
</style>
