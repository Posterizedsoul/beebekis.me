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

	function prev() {
		index = (index - 1 + images.length) % images.length;
	}
	function next() {
		index = (index + 1) % images.length;
	}

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
		{#if images.length > 1}
			<button
				type="button"
				class="lightbox-nav left-4"
				onclick={(e) => {
					e.stopPropagation();
					prev();
				}}
				aria-label="Previous image"
			>
				<ChevronLeft size={28} />
			</button>
		{/if}

		<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
		<div class="lightbox-stage" onclick={(e) => e.stopPropagation()}>
			<img src={current.url} alt={current.alt || 'Image'} class="lightbox-img" />
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
		</div>

		{#if images.length > 1}
			<button
				type="button"
				class="lightbox-nav right-4"
				onclick={(e) => {
					e.stopPropagation();
					next();
				}}
				aria-label="Next image"
			>
				<ChevronRight size={28} />
			</button>
		{/if}

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
		max-width: min(90vw, 1400px);
		max-height: 88vh;
	}

	.lightbox-img {
		max-width: 100%;
		max-height: 78vh;
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

	.lightbox-nav {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		border: none;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.12);
		color: #fff;
		cursor: pointer;
		transition:
			background 0.2s,
			transform 0.2s;
	}

	.lightbox-nav:hover {
		background: rgba(255, 255, 255, 0.25);
		transform: translateY(-50%) scale(1.05);
	}

	.lightbox-nav.left-4 {
		left: 1rem;
	}

	.lightbox-nav.right-4 {
		right: 1rem;
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
