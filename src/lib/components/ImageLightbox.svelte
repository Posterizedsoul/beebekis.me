<script module lang="ts">
	export interface LightboxImage {
		url: string;
		alt?: string;
		caption?: string;
	}

	/** Collect every image inside `container` (in document order) with its group caption. */
	export function collectImages(container: HTMLElement): LightboxImage[] {
		return Array.from(container.querySelectorAll('img')).map((img) => ({
			url: img.src,
			alt: img.alt || '',
			caption:
				img.closest('.image-group')?.querySelector('.image-group-caption')?.textContent?.trim() ||
				''
		}));
	}
</script>

<script lang="ts">
	import { X, ChevronLeft, ChevronRight } from 'lucide-svelte';

	let {
		images,
		startIndex = 0,
		onClose
	}: { images: LightboxImage[]; startIndex?: number; onClose: () => void } = $props();

	let index = $state(startIndex);
	let current = $derived(images[index]);
	let thumbsEl: HTMLElement | undefined = $state();

	function prev() {
		index = (index - 1 + images.length) % images.length;
	}
	function next() {
		index = (index + 1) % images.length;
	}

	// Keep the active thumbnail in view
	$effect(() => {
		thumbsEl
			?.querySelector(`[data-thumb="${index}"]`)
			?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose();
		else if (e.key === 'ArrowLeft' && images.length > 1) prev();
		else if (e.key === 'ArrowRight' && images.length > 1) next();
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if current}
	<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
	<div class="lightbox" onclick={onClose} role="dialog" aria-modal="true">
		<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
		<div class="lightbox-stage" onclick={(e) => e.stopPropagation()}>
			<!-- Image with the arrows hugging its edges -->
			<div class="lightbox-frame">
				<img src={current.url} alt={current.alt || 'Image'} class="lightbox-img" />
				{#if images.length > 1}
					<button
						type="button"
						class="lightbox-nav lightbox-prev"
						onclick={prev}
						aria-label="Previous image"
					>
						<ChevronLeft size={26} />
					</button>
					<button
						type="button"
						class="lightbox-nav lightbox-next"
						onclick={next}
						aria-label="Next image"
					>
						<ChevronRight size={26} />
					</button>
				{/if}
			</div>

			{#if current.caption || images.length > 1}
				<div class="lightbox-bar">
					{#if current.caption}
						<span class="lightbox-caption">{current.caption}</span>
					{/if}
					{#if images.length > 1}
						<span class="lightbox-counter">{index + 1} / {images.length}</span>
					{/if}
				</div>
			{/if}

			{#if images.length > 1}
				<div class="lightbox-thumbs" bind:this={thumbsEl}>
					{#each images as image, i (i)}
						<button
							type="button"
							class="lightbox-thumb"
							class:active={i === index}
							data-thumb={i}
							onclick={() => (index = i)}
							aria-label="View image {i + 1}"
						>
							<img src={image.url} alt="" loading="lazy" />
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<button type="button" class="lightbox-close" onclick={onClose} aria-label="Close">
			<X size={20} />
		</button>
	</div>
{/if}

<style>
	.lightbox {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.88);
		animation: fadeIn 0.25s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.lightbox-stage {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		max-width: min(92vw, 1400px);
		max-height: 92vh;
	}

	.lightbox-frame {
		position: relative;
		display: inline-block;
	}

	.lightbox-img {
		max-width: min(92vw, 1400px);
		max-height: 68vh;
		object-fit: contain;
		border-radius: 8px;
		animation: zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes zoomIn {
		from {
			opacity: 0;
			transform: scale(0.92);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.lightbox-bar {
		display: flex;
		align-items: baseline;
		gap: 1rem;
		max-width: 90vw;
		color: rgba(255, 255, 255, 0.85);
		font-size: 0.9rem;
		line-height: 1.5;
		text-align: center;
	}

	.lightbox-caption {
		flex: 1;
	}

	.lightbox-counter {
		flex-shrink: 0;
		font-variant-numeric: tabular-nums;
		color: rgba(255, 255, 255, 0.55);
	}

	/* Arrows overlaid on the image edges so prev/next are always close together */
	.lightbox-nav {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.75rem;
		height: 2.75rem;
		border: none;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.45);
		color: #fff;
		cursor: pointer;
		transition:
			background 0.2s,
			transform 0.2s;
	}

	.lightbox-nav:hover {
		background: rgba(0, 0, 0, 0.7);
		transform: translateY(-50%) scale(1.06);
	}

	.lightbox-prev {
		left: 0.75rem;
	}

	.lightbox-next {
		right: 0.75rem;
	}

	/* Thumbnail strip */
	.lightbox-thumbs {
		display: flex;
		gap: 0.5rem;
		max-width: min(92vw, 1400px);
		overflow-x: auto;
		padding: 0.25rem 0.25rem 0.5rem;
		scrollbar-width: thin;
	}

	.lightbox-thumb {
		flex-shrink: 0;
		width: 4rem;
		height: 2.75rem;
		padding: 0;
		border: 2px solid transparent;
		border-radius: 6px;
		overflow: hidden;
		background: none;
		cursor: pointer;
		opacity: 0.5;
		transition:
			opacity 0.2s,
			border-color 0.2s;
	}

	.lightbox-thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.lightbox-thumb:hover {
		opacity: 0.85;
	}

	.lightbox-thumb.active {
		opacity: 1;
		border-color: #fff;
	}

	.lightbox-close {
		position: absolute;
		top: 1rem;
		right: 1rem;
		padding: 0.6rem;
		background: rgba(255, 255, 255, 0.12);
		border: none;
		border-radius: 50%;
		color: #fff;
		cursor: pointer;
		transition: background 0.2s;
		z-index: 10;
	}

	.lightbox-close:hover {
		background: rgba(255, 255, 255, 0.25);
	}

	@media (prefers-reduced-motion: reduce) {
		.lightbox,
		.lightbox-img {
			animation: none;
		}
	}
</style>
