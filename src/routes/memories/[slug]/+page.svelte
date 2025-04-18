<script lang="ts">
	import type { PageData } from './$types';
	import { fade, scale } from 'svelte/transition';
	import { Tween } from 'svelte/motion';
	import { cubicOut, cubicIn } from 'svelte/easing';
	import { onMount, onDestroy } from 'svelte';

export let data: PageData;

	// Use the FULL images array from loaded data for lightbox
	const allImages = data.allImages || [];
	console.log('Loaded ALL images for lightbox:', allImages);

	// Separate gallery images for masonry
	const galleryImages = data.galleryImages || [];
	const heroImage = data.heroImage;

	// Lightbox state
	let lightboxOpen = false;
	let selectedImageSrc: string | null = null;
	let selectedImageAlt: string = '';
	let selectedImageIndex = -1;
	let slideDirection = 1;
	let isLoadingImage = false;
	let isAnimating = false;
	const transitionDuration = 200;
	const slideDuration = 400;

	// Use Tween class instance for image animation
	const imageAnimationProps = new Tween(
		{ x: 0, opacity: 1 },
		{ duration: slideDuration, easing: cubicOut }
	);

	// --- Preload Cache ---
	let preloadedImages = new Map<string, { status: 'loading' | 'loaded' | 'error', element?: HTMLImageElement }>();

	// --- Refined Preload Helper ---
	function preloadImage(src: string) {
		if (!src || preloadedImages.has(src)) return;

		const img = new Image();
		preloadedImages.set(src, { status: 'loading', element: img });

		img.onload = () => {
			preloadedImages.set(src, { status: 'loaded', element: img });
			console.log('Preloaded:', src);
		};
		img.onerror = () => {
			preloadedImages.set(src, { status: 'error' });
			console.error('Failed to preload image:', src);
		};
		img.src = src;
	}

	// Update openLightbox to use the index from the FULL allImages array
	function openLightbox(image: { src: string; alt: string }, indexInFullArray: number) {
		console.log('openLightbox called with:', image, indexInFullArray);
		selectedImageSrc = image.src;
		selectedImageAlt = image.alt;
		selectedImageIndex = indexInFullArray;
		lightboxOpen = true;
		isLoadingImage = false;
		isAnimating = false;
		imageAnimationProps.set({ x: 0, opacity: 1 }, { duration: 0 });

		// Preload next/prev images using the full array
		if (allImages.length > 1) {
			const nextIndex = (indexInFullArray + 1) % allImages.length;
			const prevIndex = (indexInFullArray - 1 + allImages.length) % allImages.length;
			preloadImage(allImages[nextIndex].src);
			if (nextIndex !== prevIndex) {
				preloadImage(allImages[prevIndex].src);
			}
		}
		preloadImage(image.src);
	}

	function closeLightbox() {
		lightboxOpen = false;
		selectedImageSrc = null;
		selectedImageAlt = '';
		selectedImageIndex = -1;
		isLoadingImage = false;
		isAnimating = false;
	}

	async function animateAndLoad(targetIndex: number, animationDirection: number) {
		if (isAnimating || isLoadingImage) return;

		isAnimating = true;
		slideDirection = animationDirection;

		await imageAnimationProps.set({ x: -100 * slideDirection, opacity: 0 }, { duration: slideDuration, easing: cubicIn });

		isLoadingImage = true;
		const newImage = allImages[targetIndex];
		const newSrc = newImage.src;

		imageAnimationProps.set({ x: 100 * slideDirection, opacity: 0 }, { duration: 0 });

		selectedImageIndex = targetIndex;
		selectedImageSrc = newSrc;
		selectedImageAlt = newImage.alt;

		const animateIn = async () => {
			isLoadingImage = false;
			await imageAnimationProps.set({ x: 0, opacity: 1 }, { duration: slideDuration, easing: cubicOut });
			isAnimating = false;

			const nextPreloadIndex = (targetIndex + 1) % allImages.length;
			const prevPreloadIndex = (targetIndex - 1 + allImages.length) % allImages.length;
			preloadImage(allImages[nextPreloadIndex].src);
			if (nextPreloadIndex !== prevPreloadIndex) {
				preloadImage(allImages[prevPreloadIndex].src);
			}
		};

		const handleLoadError = (errorSrc: string) => {
			console.error('Failed to load/decode image for animation:', errorSrc);
			isLoadingImage = false;
			isAnimating = false;
		};

		const preloaded = preloadedImages.get(newSrc);

		if (preloaded && preloaded.status === 'loaded' && preloaded.element) {
			preloaded.element.decode().then(animateIn).catch(() => { animateIn(); });
		} else if (preloaded && preloaded.status === 'loading' && preloaded.element) {
			preloaded.element.onload = () => {
				preloadedImages.set(newSrc, { status: 'loaded', element: preloaded.element });
				preloaded.element?.decode().then(animateIn).catch(() => { animateIn(); });
			};
			preloaded.element.onerror = () => {
				preloadedImages.set(newSrc, { status: 'error' });
				handleLoadError(newSrc);
			};
		} else {
			preloadImage(newSrc);
			const loadingEntry = preloadedImages.get(newSrc);
			if (!loadingEntry || !loadingEntry.element) {
				handleLoadError(newSrc); return;
			}
			loadingEntry.element.onload = () => {
				preloadedImages.set(newSrc, { status: 'loaded', element: loadingEntry.element });
				loadingEntry.element?.decode().then(animateIn).catch(() => { animateIn(); });
			};
			loadingEntry.element.onerror = () => {
				preloadedImages.set(newSrc, { status: 'error' });
				handleLoadError(newSrc);
			};
			if (loadingEntry.element.src !== newSrc) {
				loadingEntry.element.src = newSrc;
			}
		}
	}

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
	<meta name="description" content={data.description || `A gallery of memories: ${data.title}`} />
</svelte:head>

<!-- Hero Section -->
<section class="hero-section relative mb-10 md:mb-16 bg-gray-200">
	{#if heroImage}
		<img
			src={heroImage.src}
			alt={heroImage.alt || data.title || 'Hero image'}
			class="w-full h-[60vh] md:h-[70vh] object-cover block"
			loading="eager" />
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
				on:click={() => openLightbox(heroImage, 0)}
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
			<h1 class="text-3xl md:text-4xl font-semibold mb-2">{data.title}</h1>
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
			{#each galleryImages as image, index (image.src)}
				{@const fullIndex = index + 1}
				{@const _ = console.log(`[Gallery Item ${fullIndex}] Rendering with alt: "${image.alt}"`)}
				<div
					class="gallery-item"
					on:click={() => { console.log('Gallery item clicked:', fullIndex); openLightbox(image, fullIndex); }}
					role="button"
					tabindex="0"
					title={image.alt || 'View larger image'}
					on:keydown={(e) => e.key === 'Enter' && openLightbox(image, fullIndex)}
				>
					<img src={image.src} alt={image.alt} loading="lazy" />
				</div>
			{/each}
		</div>
	{:else if !heroImage}
		<p class="text-center text-gray-500">No images found in this memoir.</p>
	{/if}
</section>

<!-- Lightbox Modal -->
{#if lightboxOpen}
	{@const _ = console.log('Rendering lightbox...')}
	<div
		class="lightbox-overlay"
		on:click={closeLightbox}
		role="dialog"
		aria-modal="true"
		aria-label="Image Lightbox"
		tabindex="-1"
		transition:fade={{ duration: transitionDuration }}
	>
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
				{#if isLoadingImage}
					<div class="loading-indicator">Loading...</div>
				{/if}
				<div class="lightbox-image-wrapper">
					<img
						src={selectedImageSrc}
						alt={selectedImageAlt}
						decoding="async"
						loading="lazy"
						style="opacity: {imageAnimationProps.current.opacity}; transform: translateX({imageAnimationProps.current.x}%);"
					/>
				</div>
				{#if selectedImageAlt}
					<div class="lightbox-caption">{selectedImageAlt}</div>
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

		{#if allImages.length > 1}
		<div class="thumbnail-strip">
			{#each allImages as image, index (image.src)}
				<div
					class="thumbnail-item"
					class:active={index === selectedImageIndex}
					on:click|stopPropagation={() => jumpToImage(index)}
					role="button"
					aria-label={`Go to image ${index + 1}: ${image.alt || ''}`}
					tabindex="0"
					on:keydown={(e) => e.key === 'Enter' && jumpToImage(index)}
				>
					<img src={image.src} alt={`Thumbnail ${index + 1}`} loading="lazy" />
				</div>
			{/each}
		</div>
		{/if}
	</div>
{/if}

<style>
	.memories-container {
		margin: 2rem auto;
		padding: 1rem;
	}

	.image-gallery {
		/* Masonry via CSS columns */
		columns: 1; /* Default to 1 column on smallest screens */
		column-gap: 1.5rem; /* Slightly larger gap */
		margin-top: 1.5rem;
	}
	/* Adjust column count based on screen size */
	@media (min-width: 640px) { /* Small screens and up */
		.image-gallery { columns: 2; }
	}
	@media (min-width: 1024px) { /* Large screens */
		.image-gallery { columns: 3; } /* Max 3 columns for larger images */
	}

	.gallery-item {
		display: inline-block; /* Important for column layout */
		width: 100%;
		margin-bottom: 1.5rem; /* Match column-gap */
		overflow: hidden;
		border-radius: 12px; /* Slightly larger radius */
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1); /* Slightly softer shadow */
		transition: transform 0.3s ease, box-shadow 0.3s ease; /* Smoother transition */
		cursor: pointer;
		break-inside: avoid; /* Prevent items breaking across columns */
	}
	.gallery-item:hover {
		transform: scale(1.03); /* Slightly larger scale effect */
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2); /* More pronounced shadow on hover */
	}

	.gallery-item img {
		display: block; /* Ensure no extra space below image */
		width: 100%;
		height: auto;
		object-fit: cover;
		border-radius: 12px; /* Match parent radius */
	}

	.lightbox-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.85);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		z-index: 1000;
		padding: 10px;
		box-sizing: border-box;
		cursor: pointer;
	}

	.lightbox-main-area {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		max-width: 95%;
		flex-grow: 1;
		min-height: 0;
	}

	.lightbox-content {
		position: relative;
		width: auto;
		max-height: calc(100% - 80px);
		cursor: default;
		overflow: visible;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.lightbox-image-wrapper {
		overflow: hidden;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: auto;
		max-height: 100%;
	}

	.lightbox-content img {
		display: block;
		max-width: 100%;
		max-height: calc(100vh - 140px);
		width: auto;
		height: auto;
		object-fit: contain;
		will-change: transform, opacity;
		border-radius: 3px;
		box-shadow: 0 5px 20px rgba(0,0,0,0.4);
	}

	.lightbox-caption {
		color: #eee;
		text-align: center;
		margin-top: 10px;
		padding: 5px 10px;
		background-color: rgba(0, 0, 0, 0.5);
		border-radius: 4px;
		font-size: 0.9em;
		max-width: 80%;
	}

	.lightbox-nav {
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.6);
		font-size: 2.5rem;
		cursor: pointer;
		padding: 1rem;
		z-index: 1002;
		transition: color 0.2s ease, transform 0.2s ease;
		line-height: 1;
		margin: 0 5px;
		align-self: center;
	}

	.lightbox-nav:hover {
		color: white;
		transform: scale(1.1);
	}

	.lightbox-nav[disabled] {
		opacity: 0.3;
		cursor: not-allowed;
		transform: none;
	}

	.loading-indicator {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background-color: rgba(0, 0, 0, 0.7);
		color: white;
		padding: 10px 20px;
		border-radius: 5px;
		z-index: 10;
		font-size: 0.9em;
	}

	.thumbnail-strip {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-wrap: nowrap;
		gap: 8px;
		padding: 10px 0;
		margin-top: auto;
		width: 100%;
		max-width: 90%;
		overflow-x: auto;
		flex-shrink: 0;
		height: 70px;
		scrollbar-width: thin;
		scrollbar-color: rgba(255,255,255,0.3) transparent;
	}
	.thumbnail-strip::-webkit-scrollbar {
		height: 5px;
	}
	.thumbnail-strip::-webkit-scrollbar-thumb {
		background-color: rgba(255,255,255,0.3);
		border-radius: 3px;
	}

	.thumbnail-item {
		cursor: pointer;
		padding: 2px;
		border: 2px solid transparent;
		border-radius: 4px;
		transition: border-color 0.2s ease, transform 0.2s ease;
		flex-shrink: 0;
	}

	.thumbnail-item img {
		display: block;
		height: 50px;
		width: auto;
		object-fit: cover;
		border-radius: 2px;
		opacity: 0.6;
		transition: opacity 0.2s ease;
	}

	.thumbnail-item:hover img {
		opacity: 0.8;
	}
	.thumbnail-item:hover {
		transform: scale(1.05);
	}

	.thumbnail-item.active {
		border-color: #fff;
	}

	.thumbnail-item.active img {
		opacity: 1;
	}

	.text-shadow {
		text-shadow: 0 1px 3px rgba(0,0,0,0.5);
	}
</style>