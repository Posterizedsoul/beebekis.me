<script lang="ts">
	import { onMount, tick } from 'svelte';
	import Sortable from 'sortablejs';

	let { images = $bindable([]), onRemove } = $props();

	let gridContainer: HTMLElement;

	// Pagination state - show images in chunks for performance
	const PAGE_SIZE = 10;
	let visibleCount = $state(PAGE_SIZE);

	// Lightbox state
	let lightboxOpen = $state(false);
	let lightboxImage = $state('');

	// Get currently visible images
	let visibleImages = $derived(images.slice(0, visibleCount));
	let hasMore = $derived(visibleCount < images.length);

	function loadMore() {
		visibleCount = Math.min(visibleCount + PAGE_SIZE, images.length);
	}

	function showAll() {
		visibleCount = images.length;
	}

	function openLightbox(imageUrl: string) {
		lightboxImage = imageUrl;
		lightboxOpen = true;
	}

	function closeLightbox() {
		lightboxOpen = false;
		lightboxImage = '';
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && lightboxOpen) {
			closeLightbox();
		}
	}

	let sortableInstance: any;

	onMount(() => {
		tick().then(() => {
			if (gridContainer) {
				sortableInstance = Sortable.create(gridContainer, {
					animation: 150,
					handle: '.drag-handle',
					onEnd: (evt: any) => {
						if (evt.oldIndex !== undefined && evt.newIndex !== undefined) {
							const oldActualIndex = images.indexOf(visibleImages[evt.oldIndex]);
							const newActualIndex = images.indexOf(visibleImages[evt.newIndex]);

							if (oldActualIndex !== -1 && newActualIndex !== -1) {
								const item = images.splice(oldActualIndex, 1)[0];
								images.splice(newActualIndex, 0, item);
								images = [...images];
							}
						}
					}
				});
			}
		});

		return () => {
			if (sortableInstance) {
				sortableInstance.destroy();
			}
		};
	});

	function handleRemove(index: number) {
		if (onRemove) {
			onRemove(index);
		} else {
			images = images.filter((_, i) => i !== index);
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div
	bind:this={gridContainer}
	class="image-grid mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
>
	{#each visibleImages as image, index (image.url)}
		<div
			class="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
			ondblclick={() => openLightbox(image.url)}
			role="button"
			tabindex="0"
			onkeydown={(e) => e.key === 'Enter' && openLightbox(image.url)}
		>
			<img
				src={image.url}
				alt={image.altText || 'Preview'}
				loading="lazy"
				decoding="async"
				class="h-full w-full cursor-pointer object-cover"
			/>

			<!-- Drag Handle Overlay -->
			<div
				class="drag-handle absolute inset-0 cursor-move bg-black/10 opacity-0 hover:opacity-100"
			></div>

			<!-- Controls -->
			<div
				class="absolute top-1 right-1 z-10 flex space-x-1 sm:opacity-0 sm:group-hover:opacity-100"
			>
				<button
					type="button"
					onclick={() => handleRemove(images.indexOf(image))}
					class="rounded-full bg-red-600 p-1 text-white shadow-sm hover:bg-red-700 focus:outline-none"
					title="Remove image"
					aria-label="Remove image"
				>
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
		</div>
	{/each}
</div>

{#if images.length === 0}
	<p class="mt-4 text-center text-sm text-gray-500 italic">No images added yet.</p>
{:else}
	<div class="mt-4 flex flex-col items-center gap-2">
		<p class="text-xs text-gray-400">
			Showing {visibleImages.length} of {images.length} images (double-click to preview)
		</p>
		{#if hasMore}
			<div class="flex gap-2">
				<button
					type="button"
					onclick={loadMore}
					class="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
				>
					Load More ({Math.min(PAGE_SIZE, images.length - visibleCount)} more)
				</button>
				<button
					type="button"
					onclick={showAll}
					class="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
				>
					Show All
				</button>
			</div>
		{/if}
	</div>
{/if}

<!-- Lightbox Modal -->
{#if lightboxOpen}
	<div
		class="lightbox-overlay"
		onclick={closeLightbox}
		role="dialog"
		aria-modal="true"
		aria-label="Image preview"
	>
		<button class="lightbox-close" onclick={closeLightbox} aria-label="Close preview">
			<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 18L18 6M6 6l12 12"
				/>
			</svg>
		</button>
		<img
			src={lightboxImage}
			alt="Full size preview"
			class="lightbox-image"
			onclick={(e) => e.stopPropagation()}
		/>
	</div>
{/if}

<style>
	.image-grid {
		contain: layout style;
		will-change: contents;
	}
	.image-grid > div {
		contain: layout style paint;
		will-change: transform;
	}
	.image-grid img {
		will-change: transform;
		transform: translateZ(0);
	}

	/* Lightbox styles */
	.lightbox-overlay {
		position: fixed;
		inset: 0;
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: rgba(0, 0, 0, 0.9);
		cursor: pointer;
	}

	.lightbox-close {
		position: absolute;
		top: 1rem;
		right: 1rem;
		color: white;
		background: rgba(0, 0, 0, 0.5);
		border: none;
		border-radius: 50%;
		padding: 0.5rem;
		cursor: pointer;
		transition: background 0.2s;
	}
	.lightbox-close:hover {
		background: rgba(0, 0, 0, 0.8);
	}

	.lightbox-image {
		max-width: 90vw;
		max-height: 90vh;
		object-fit: contain;
		border-radius: 0.5rem;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
		cursor: default;
	}
</style>
