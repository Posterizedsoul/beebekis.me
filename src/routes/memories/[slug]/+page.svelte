<script lang="ts">
	import type { PageData } from './$types';
	import { fade, scale } from 'svelte/transition';
	import { Tween } from 'svelte/motion';
	import { cubicOut, cubicIn } from 'svelte/easing';
	import { onMount, onDestroy } from 'svelte';
	import { PUBLIC_BASE_URL } from '$env/static/public'; // Import base URL
	import { page } from '$app/state'; // Import page from $app/state
	// Import the enhanced image component type if needed for strict typing, otherwise it's globally available
	// import type { EnhancedImg } from '@sveltejs/enhanced-img';

	export let data: PageData;

	// Types for enhanced image data passed from server
	interface EnhancedImageModuleData {
		src: string;
		srcset: string;
		width: number;
		height: number;
	}
	interface EnhancedImageInfo {
		src: EnhancedImageModuleData;
		alt: string;
		filename: string;
	}

	// Use the FULL images array from loaded data for lightbox
	const allImages: EnhancedImageInfo[] = data.allImages || [];

	// Separate gallery images for masonry
	const galleryImages: EnhancedImageInfo[] = data.galleryImages || [];
	const heroImage: EnhancedImageInfo | null = data.heroImage;

	// Construct URLs and descriptions for meta tags
	const baseUrl = PUBLIC_BASE_URL || 'https://www.beebekis.me'; // Use env variable or fallback
	const memoryUrl = `${baseUrl}${page.url.pathname}`;
	const memoryDescription = data.description || `A gallery of memories: ${data.title}`;
	// Use the base src from the enhanced hero image object for meta tags
	const memoryImageUrl = heroImage?.src?.src
		? heroImage.src.src.startsWith('http')
			? heroImage.src.src
			: `${baseUrl}${heroImage.src.src.startsWith('/') ? '' : '/'}${heroImage.src.src}` // Ensure leading slash if relative
		: `${baseUrl}/b.png`; // Updated Fallback image

	// Lightbox state
	let lightboxOpen = false;
	let selectedImageInfo: EnhancedImageInfo | null = null; // Store the whole info object
	let selectedImageIndex = -1;
	let slideDirection = 1;
	let isLoadingImage = false; // Still useful for UI feedback during animation/preload coordination
	let isAnimating = false;
	const transitionDuration = 200;
	const slideDuration = 400;

	// Use Tween class instance for image animation
	const imageAnimationProps = new Tween(
		{ x: 0, opacity: 1 },
		{ duration: slideDuration, easing: cubicOut }
	);

	// --- Preload Cache (Might be less critical with enhanced:img, but keep for lightbox smoothness) ---
	let preloadedImages = new Map<string, { status: 'loading' | 'loaded' | 'error', element?: HTMLImageElement }>();

	// --- Refined Preload Helper ---
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
		img.src = src; // Preload the base src
	}

	// Update openLightbox to use the index from the FULL allImages array
	function openLightbox(imageInfo: EnhancedImageInfo, indexInFullArray: number) {
		console.log(`openLightbox called. Index: ${indexInFullArray}, Filename: ${imageInfo.filename}`); // Add log
		if (indexInFullArray < 0 || indexInFullArray >= allImages.length) {
			console.error(`Invalid index passed to openLightbox: ${indexInFullArray}`);
			return; // Prevent opening with invalid index
		}
		selectedImageInfo = imageInfo;
		selectedImageIndex = indexInFullArray;
		lightboxOpen = true;
		isLoadingImage = false; // Reset state
		isAnimating = false;
		imageAnimationProps.set({ x: 0, opacity: 1 }, { duration: 0 }); // Reset animation state

		// Preload next/prev images using the full array's base src
		if (allImages.length > 1) {
			const nextIndex = (indexInFullArray + 1) % allImages.length;
			const prevIndex = (indexInFullArray - 1 + allImages.length) % allImages.length;
			preloadImage(allImages[nextIndex].src.src); // Preload base src
			if (nextIndex !== prevIndex) {
				preloadImage(allImages[prevIndex].src.src); // Preload base src
			}
		}
		preloadImage(imageInfo.src.src); // Preload current base src

		// Ensure loading state is false initially when opening
		isLoadingImage = false;
		isAnimating = false;
	}

	function closeLightbox() {
		console.log('closeLightbox called'); // Add log
		lightboxOpen = false;
		selectedImageInfo = null;
		selectedImageIndex = -1;
		isLoadingImage = false;
		isAnimating = false;
	}

	// Simplified animateAndLoad function
	async function animateAndLoad(targetIndex: number, animationDirection: number) {
		if (isAnimating) return; // Only block if already animating

		isAnimating = true;
		isLoadingImage = true; // Show loading indicator during transition
		slideDirection = animationDirection;

		// Animate out the current image
		await imageAnimationProps.set({ x: -100 * slideDirection, opacity: 0 }, { duration: slideDuration, easing: cubicIn });

		// Update selected image data - this triggers the {#key} block to remount the image
		selectedImageIndex = targetIndex;
		selectedImageInfo = allImages[targetIndex];

		// Set animation state for incoming image (off-screen)
		imageAnimationProps.set({ x: 100 * slideDirection, opacity: 0 }, { duration: 0 });

		 // Animate the new image in (assuming {#key} handles the loading)
		await imageAnimationProps.set({ x: 0, opacity: 1 }, { duration: slideDuration, easing: cubicOut });

		isLoadingImage = false; // Hide loading indicator
		isAnimating = false; // Animation finished

		// Preload adjacent images (keep this)
		const nextPreloadIndex = (targetIndex + 1) % allImages.length;
		const prevPreloadIndex = (targetIndex - 1 + allImages.length) % allImages.length;
		preloadImage(allImages[nextPreloadIndex].src.src);
		if (nextPreloadIndex !== prevPreloadIndex) {
			preloadImage(allImages[prevPreloadIndex].src.src);
		}
	}

	// --- Navigation functions remain largely the same ---
	function navigateLightbox(stepDirection: number) {
		if (isAnimating || isLoadingImage || !lightboxOpen || allImages.length <= 1) return;
		const targetIndex = (selectedImageIndex + stepDirection + allImages.length) % allImages.length;
		animateAndLoad(targetIndex, stepDirection);
	}

	function jumpToImage(targetIndex: number) {
		if (targetIndex === selectedImageIndex || isAnimating || isLoadingImage || !lightboxOpen) return;
		const animationDirection = targetIndex > selectedImageIndex ? 1 : -1;
		animateAndLoad(targetIndex, animationDirection);
	}

	function goToNextImage() { navigateLightbox(1); }
	function goToPrevImage() { navigateLightbox(-1); }

	function handleKeydown(event: KeyboardEvent) {
		if (lightboxOpen && !isLoadingImage && !isAnimating) {
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

<svelte:window on:keydown={handleKeydown}/>

<svelte:head>
	<title>{data.title || 'Memoir Gallery'}</title>
	<meta name="description" content={memoryDescription} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="article" /> <!-- Or 'website' if more appropriate -->
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

	<!-- Link to your canonical URL -->
	<link rel="canonical" href={memoryUrl} />
</svelte:head>

<!-- Hero Section -->
<section class="hero-section relative mb-10 md:mb-16 bg-gray-200">
	{#if heroImage}
		<enhanced:img
			src={heroImage.src}
			alt={heroImage.alt || data.title || 'Hero image'}
			class="w-full h-[60vh] md:h-[70vh] object-cover block"
			loading="eager"
			fetchpriority="high"
			sizes="100vw"
		/>
		<div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
		<header class="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white z-10">
			<h1 class="text-3xl md:text-5xl font-bold mb-2 text-shadow">{data.title}</h1>
			{#if data.date}
				<p class="text-md md:text-lg text-gray-200 text-shadow">{formatDate(data.date)}</p>
			{/if}
			{#if data.description}
				<p class="mt-3 md:mt-4 text-lg md:text-xl text-gray-100 max-w-3xl text-shadow">{data.description}</p>
			{/if}
			<button
				on:click={() => {
					const heroIndex = allImages.findIndex(img => img.filename === heroImage.filename);
					openLightbox(heroImage, heroIndex >= 0 ? heroIndex : 0); // Pass calculated index or 0 as fallback
				}}
				class="absolute top-4 right-4 text-white bg-black/30 rounded-full p-2 hover:bg-black/50 transition-colors z-10"
				aria-label="View hero image larger"
				title="View hero image larger"
			>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
					<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
				</svg>
			</button>
		</header>
	{:else}
		<header class="text-center py-16 px-4">
			<h1 class="text-3xl md:text-4xl font-semibold mb-2 text-gray-900">{data.title}</h1>
			{#if data.date}
				<p class="text-md text-gray-600">{formatDate(data.date)}</p>
			{/if}
			{#if data.description}
				<p class="mt-4 text-lg text-gray-700 max-w-3xl mx-auto">{data.description}</p>
			{/if}
		</header>
	{/if}
</section>

<!-- Main Content Area (Gallery + Text) -->
<section class="memories-container max-w-6xl mx-auto px-4 pb-8 md:pb-16">

	{#if data.contentHtml}
		<div class="prose lg:prose-xl max-w-none mb-10 md:mb-16">
			{@html data.contentHtml}
		</div>
	{/if}

	{#if galleryImages.length > 0}
		<h2 class="text-2xl font-semibold mb-6 text-gray-700">Gallery</h2>
		<div class="image-gallery">
			{#each galleryImages as imageInfo (imageInfo.filename)}
				{@const fullIndex = allImages.findIndex(img => img.filename === imageInfo.filename)}
				<div
					class="gallery-item"
					on:click={() => openLightbox(imageInfo, fullIndex)}
					role="button"
					tabindex="0"
					title={imageInfo.alt || 'View larger image'}
					on:keydown={(e) => e.key === 'Enter' && openLightbox(imageInfo, fullIndex)}
				>
					<!-- Use enhanced:img for gallery items -->
					<enhanced:img
						src={imageInfo.src}
						alt={imageInfo.alt}
						loading="lazy"
						fetchpriority="low"
						sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
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
	{@const _ = console.log(`Rendering Lightbox. Index: ${selectedImageIndex}, Filename: ${selectedImageInfo.filename}`)}
	<div
		class="lightbox-overlay"
		on:click={closeLightbox}
		role="dialog"
		aria-modal="true"
		aria-label="Image Lightbox"
		tabindex="-1"
		transition:fade={{ duration: transitionDuration }}
	>
		<!-- Main area for image and nav buttons -->
		<div class="lightbox-main-area">
			{#if allImages.length > 1}
			<button
				class="lightbox-nav prev"
				on:click|stopPropagation={goToPrevImage}
				aria-label="Previous image"
				disabled={isLoadingImage || isAnimating}
			>
				&#10094;
			</button>
			{/if}

			<div
				class="lightbox-content"
				on:click|stopPropagation
				role="presentation"
				transition:scale={{ duration: transitionDuration, start: 0.9 }}
			>
				{#if isLoadingImage && isAnimating} <!-- Show loading only during animation phase -->
					<div class="loading-indicator">Loading...</div>
				{/if}
				<div
					class="lightbox-image-wrapper"
					style="opacity: {imageAnimationProps.current.opacity}; transform: translateX({imageAnimationProps.current.x}%);"
				>
					{#key selectedImageIndex}
						<!-- Use enhanced:img in lightbox -->
						<enhanced:img
							src={selectedImageInfo.src}
							alt={selectedImageInfo.alt}
							loading="lazy"
							sizes="90vw"
							class="lightbox-image-enhanced"
						/>
					{/key}
				</div>
				<!-- Caption moved outside the key block -->
				{#if selectedImageInfo.alt}
					<div class="lightbox-caption">{selectedImageInfo.alt}</div>
				{/if}
			</div>

			{#if allImages.length > 1}
			<button
				class="lightbox-nav next"
				on:click|stopPropagation={goToNextImage}
				aria-label="Next image"
				disabled={isLoadingImage || isAnimating}
			>
				&#10095;
			</button>
			{/if}
		</div>

		<!-- Thumbnail strip moved outside main area -->
		{#if allImages.length > 1}
		<div class="thumbnail-strip">
			{#each allImages as imageInfo, index (imageInfo.filename)}
				<div
					class="thumbnail-item"
					class:active={index === selectedImageIndex}
					on:click|stopPropagation={() => jumpToImage(index)}
					role="button"
					tabindex="0"
					aria-label={`View image ${index + 1}`}
					title={imageInfo.alt || `Image ${index + 1}`}
					on:keydown={(e) => e.key === 'Enter' && jumpToImage(index)}
				>
					<!-- Use enhanced:img for thumbnails -->
					<enhanced:img
						src={imageInfo.src}
						alt={imageInfo.alt || `Thumbnail ${index + 1}`}
						loading="lazy"
						fetchpriority="low"
						sizes="50px"
						class="thumbnail-image-enhanced"
					/>
				</div>
			{/each}
		</div>
		{/if}
	</div>
{/if}

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
		box-shadow: 0 2px 5px rgba(0,0,0,0.1);
		transition: box-shadow 0.2s ease;
	}
	.gallery-item:hover {
		box-shadow: 0 5px 15px rgba(0,0,0,0.2);
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
		background: rgba(0,0,0,0.85); /* Slightly darker */
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
		background: rgba(0,0,0,0.3); /* Add slight background */
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
		background: rgba(0,0,0,0.5);
	}
	.lightbox-nav.prev { left: 10px; } /* Adjust position */
	.lightbox-nav.next { right: 10px; } /* Adjust position */
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
		background: rgba(0,0,0,0.6);
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
		background: rgba(0,0,0,0.6); /* Add background for contrast */
		z-index: 1001;
		justify-content: center; /* Center thumbnails if they don't fill the width */
		box-sizing: border-box;
		/* Add scrollbar styling if desired */
		scrollbar-width: thin;
		scrollbar-color: rgba(255,255,255,0.3) transparent;
	}
	.thumbnail-strip::-webkit-scrollbar {
		height: 8px;
	}
	.thumbnail-strip::-webkit-scrollbar-track {
		background: transparent;
	}
	.thumbnail-strip::-webkit-scrollbar-thumb {
		background-color: rgba(255,255,255,0.3);
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
		display: flex;
		justify-content: center;
		align-items: center;
		/* Adjust max-height calculation based on thumbnail strip height and padding */
		max-height: calc(100vh - 120px); /* e.g., 80px for strip + 40px breathing room */
		width: 100%; /* Ensure wrapper takes width */
	}

	/* Style the image generated by enhanced:img within the lightbox */
	.lightbox-image-wrapper :global(img.lightbox-image-enhanced) {
		display: block;
		max-width: 100%;
		/* Use max-height from wrapper */
		max-height: calc(100vh - 120px);
		width: auto;
		height: auto;
		object-fit: contain;
		border-radius: 3px;
		box-shadow: 0 5px 20px rgba(0,0,0,0.4);
	}

	/* Style the image generated by enhanced:img within thumbnails */
	.thumbnail-item :global(img.thumbnail-image-enhanced) {
		display: block;
		height: 100%; /* Fill container */
		width: 100%; /* Fill container */
		object-fit: cover;
		/* border-radius: 2px; */ /* Removed, applied to container */
		opacity: 0.6;
		transition: opacity 0.2s ease;
		/* cursor: pointer; */ /* Removed, applied to container */
	}

	.thumbnail-item:hover :global(img.thumbnail-image-enhanced) {
		opacity: 1; /* Full opacity on hover */
	}
	.thumbnail-item.active {
		border-color: white; /* Use border instead of shadow */
	}
	.thumbnail-item.active :global(img.thumbnail-image-enhanced) {
		opacity: 1;
		/* box-shadow: 0 0 0 2px white; */ /* Replaced by border */
	}

	.text-shadow {
		text-shadow: 0 1px 3px rgba(0,0,0,0.5);
	}
</style>