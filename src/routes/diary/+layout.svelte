<script lang="ts">
	import type { LayoutData } from './$types';
	import DiaryTimeline from '$lib/components/DiaryTimeline.svelte';
	import { page } from '$app/stores';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();

	const hasSlug = $derived(!!$page.params.slug);
	const currentSlug = $derived($page.params.slug);

	let contentAreaRef: HTMLElement | null = $state(null);
	let originalScrollTop = 0;
	let isTimelineHovered = $state(false);
	let leaveTimeout: number | null = null;
	let scrollAnimationId: number | null = null;
	let isScrolling = false;

	function animateScroll(to: number, duration: number, onComplete?: () => void) {
		if (scrollAnimationId) cancelAnimationFrame(scrollAnimationId);
		if (!contentAreaRef) return;

		const from = contentAreaRef.scrollTop;
		if (from === to) {
			onComplete?.();
			return;
		}

		isScrolling = true;
		const startTime = performance.now();

		function step(now: number) {
			const t = Math.min((now - startTime) / duration, 1);
			if (contentAreaRef) contentAreaRef.scrollTop = from + (to - from) * t * (2 - t);
			if (t < 1) scrollAnimationId = requestAnimationFrame(step);
			else {
				scrollAnimationId = null;
				isScrolling = false;
				onComplete?.();
			}
		}
		scrollAnimationId = requestAnimationFrame(step);
	}

	function handleTimelineMouseEnter() {
		if (leaveTimeout) {
			clearTimeout(leaveTimeout);
			leaveTimeout = null;
		}
		if (!contentAreaRef) return;

		if (!isTimelineHovered) {
			if (!isScrolling) originalScrollTop = contentAreaRef.scrollTop;
			isTimelineHovered = true;
		}

		setTimeout(() => {
			if (isTimelineHovered) animateScroll(originalScrollTop + 66, 350);
		}, 30);
	}

	function handleTimelineMouseLeave() {
		leaveTimeout = setTimeout(() => {
			if (isTimelineHovered) {
				animateScroll(originalScrollTop, 350, () => {
					isTimelineHovered = false;
				});
			}
		}, 200) as unknown as number;
	}
</script>

<div class="diary-container" class:layout-entry={hasSlug}>
	{#if hasSlug}
		<div class="entry-content-area" bind:this={contentAreaRef}>
			<article
				class="prose prose-neutral lg:prose-lg prose-a:text-blue-600 hover:prose-a:text-blue-800 max-w-6xl text-justify"
			>
				{@render children()}
			</article>
			<!-- Spacer that adds scrollable room when timeline expands -->
			<div class="timeline-spacer" class:expanded={isTimelineHovered}></div>
		</div>
		<div
			class="timeline-area-horizontal"
			onmouseenter={handleTimelineMouseEnter}
			onmouseleave={handleTimelineMouseLeave}
		>
			<DiaryTimeline entries={data.sortedEntries} {currentSlug} layout="horizontal" />
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
		grid-template-rows: 1fr 64px;
		height: calc(100vh - 4rem);
		overflow: hidden;
		will-change: grid-template-rows;
		transition: grid-template-rows 0.45s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.layout-entry:has(.timeline-area-horizontal:hover) {
		grid-template-rows: 1fr 130px;
	}

	.layout-entry .entry-content-area {
		grid-row: 1;
		overflow-y: scroll; /* Always show scrollbar to prevent layout shift */
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2rem 1rem 0.5rem;
	}

	.timeline-spacer {
		width: 100%;
		height: 0;
		flex-shrink: 0;
	}
	.timeline-spacer.expanded {
		height: 100px;
	}

	.layout-entry .timeline-area-horizontal {
		grid-row: 2;
		overflow: hidden;
		border-top: 1px solid #e5e7eb;
		position: relative;
	}

	.layout-entry .timeline-area-horizontal::before {
		content: '';
		position: absolute;
		top: -1.5rem;
		left: 0;
		right: 0;
		height: 1.5rem;
	}

	.diary-container:not(.layout-entry) {
		height: calc(100vh - 4rem);
		overflow-y: auto;
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
