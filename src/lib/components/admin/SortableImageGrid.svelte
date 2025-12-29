<script lang="ts">
	import { onMount } from 'svelte';
	import Sortable from 'sortablejs';

	// interface ImageItem {
	//   id: string; // or unique key
	//   url: string;
	//   altText: string;
	// }

	let { images = $bindable([]), onRemove } = $props();

	let gridContainer: HTMLElement;

	onMount(() => {
		if (gridContainer) {
			Sortable.create(gridContainer, {
				animation: 150,
				handle: '.drag-handle',
				onEnd: (evt) => {
					if (evt.oldIndex !== undefined && evt.newIndex !== undefined) {
						// Reorder array based on sortable move
						const item = images.splice(evt.oldIndex, 1)[0];
						images.splice(evt.newIndex, 0, item);
						images = [...images]; // Trigger reactivity
					}
				}
			});
		}
	});

	function handleRemove(index: number) {
		if (onRemove) {
			onRemove(index);
		} else {
			images = images.filter((_, i) => i !== index);
		}
	}
</script>

<div
	bind:this={gridContainer}
	class="image-grid mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
>
	{#each images as image, index (image.url)}
		<div
			class="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
		>
			<!-- Image Preview with lazy loading -->
			<img
				src={image.url}
				alt={image.altText || 'Preview'}
				loading="lazy"
				decoding="async"
				class="h-full w-full object-cover"
			/>

			<!-- Drag Handle Overlay -->
			<div
				class="drag-handle absolute inset-0 cursor-move bg-black/10 opacity-0 transition-opacity group-hover:opacity-100"
			></div>

			<!-- Controls -->
			<div
				class="absolute right-1 top-1 z-10 flex space-x-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
			>
				<button
					type="button"
					onclick={() => handleRemove(index)}
					class="rounded-full bg-red-600 p-1 text-white shadow-sm hover:bg-red-700 focus:outline-none"
					title="Remove image"
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

			<!-- Alt Text Input (Optional quick edit) -->
			<!-- <div class="absolute bottom-0 left-0 right-0 bg-black/50 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
         <input type="text" bind:value={image.altText} class="w-full bg-transparent text-xs text-white border-none p-0 focus:ring-0" placeholder="Alt text..." />
      </div> -->
		</div>
	{/each}
</div>

{#if images.length === 0}
	<p class="mt-4 text-center text-sm italic text-gray-500">No images added yet.</p>
{/if}

<style>
	/* Performance optimizations for smooth scrolling with many images */
	.image-grid {
		contain: layout style;
	}
	.image-grid > div {
		contain: layout style paint;
		content-visibility: auto;
	}
</style>
