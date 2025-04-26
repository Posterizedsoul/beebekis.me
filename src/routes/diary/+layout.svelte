<script lang="ts">
	import type { LayoutData } from './$types';
	import DiaryTimeline from '$lib/components/DiaryTimeline.svelte';
	import { page } from '$app/stores';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();

	const hasSlug = $derived(!!$page.params.slug);
	const currentSlug = $derived($page.params.slug);
</script>

<div
	class="diary-container"
	class:layout-entry={hasSlug}
>
	{#if hasSlug}
		<div class="entry-content-area">
			<article class="prose prose-neutral lg:prose-lg max-w-6xl text-justify prose-a:text-blue-600 hover:prose-a:text-blue-800">
				{@render children()}
			</article>
		</div>
		<div class="timeline-area-horizontal">
			<DiaryTimeline
				entries={data.sortedEntries}
				{currentSlug}
				layout="horizontal"
			/>
		</div>
	{:else}
		<main class="diary-content-index">
			{@render children()}
		</main>
	{/if}
</div>

<style>
	.diary-container {
		height: calc(100vh - 4rem);
		overflow: hidden;
	}

	.layout-entry {
		display: grid;
		grid-template-columns: 1fr;
		/* Reduced timeline row height */
		grid-template-rows: minmax(0, 1fr) 160px;
		height: calc(100vh - 4rem);
		overflow: hidden;
	}
	.layout-entry .entry-content-area {
		grid-row: 1;
		overflow-y: auto;
		display: flex;
		justify-content: center;
		/* Add padding here instead of article */
		padding: 2rem 1rem; /* Adjust padding as needed (mt-8 md:mt-12 equivalent) */
	}
	.layout-entry .timeline-area-horizontal {
		grid-row: 2;
		width: 100%;
		/* Reduced height */
		height: 160px;
		overflow: hidden;
		border-top: 1px solid #e5e7eb;
	}

	.diary-container:not(.layout-entry) {
		height: calc(100vh - 4rem);
		overflow-y: auto;
	}
	.diary-container:not(.layout-entry) .diary-content-index {
	}


	@media (max-width: 768px) {
		.diary-container {
			height: auto;
			overflow: visible;
		}

		.layout-entry {
			display: flex;
			flex-direction: column-reverse;
			height: auto;
			grid-template-rows: none;
			grid-template-columns: none;
			overflow: visible;
		}
		.layout-entry .entry-content-area {
			grid-row: auto;
			overflow-y: visible;
			display: block;
			height: auto;
			/* Adjust mobile padding if needed */
			padding: 1rem;
		}
		.layout-entry .entry-content-area article {
			overflow-y: visible;
		}
		.layout-entry .timeline-area-horizontal {
			grid-row: auto;
			width: 100%;
			/* Reduced mobile height */
			height: 30vh;
			/* Reduced mobile max-height */
			max-height: 240px;
			border-top: 1px solid #e5e7eb;
			overflow: hidden;
		}

		.diary-container:not(.layout-entry) {
			height: auto;
			overflow-y: visible;
		}
		.diary-container:not(.layout-entry) .diary-content-index {
			height: auto;
		}
	}
</style>

