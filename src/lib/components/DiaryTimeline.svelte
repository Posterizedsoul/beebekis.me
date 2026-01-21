<script lang="ts">
	import type { DiaryEntry } from '$lib/types';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	export let entries: DiaryEntry[] = [];
	export let currentSlug: string | null = null;
	export let layout: 'vertical' | 'horizontal' = 'vertical';
	export let entryLimit: number | null = 30;

	let activeItemRef: HTMLElement | null = null;
	let wrapperRef: HTMLElement | null = null;
	let blobStyle = 'opacity: 0;';
	let rafId: number;

	function updateBlob() {
		if (activeItemRef) {
			const { offsetLeft, offsetWidth } = activeItemRef;
			blobStyle = `transform: translateX(${offsetLeft}px); width: ${offsetWidth}px; opacity: 1;`;
		}
	}

	function startUpdateLoop() {
		if (!browser) return;
		const loop = () => {
			updateBlob();
			rafId = requestAnimationFrame(loop);
		};
		cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(loop);
	}

	function setActiveRef(node: HTMLElement, isActive: boolean) {
		if (isActive) {
			activeItemRef = node;
			updateBlob();
		}
		return {
			update(newIsActive: boolean) {
				if (newIsActive) {
					activeItemRef = node;
					updateBlob();
				}
			}
		};
	}

	onMount(() => {
		startUpdateLoop();
		return () => cancelAnimationFrame(rafId);
	});

	$: if (entries || layout) setTimeout(updateBlob, 100);

	// Function to format date (adjust as needed)
	function formatDate(dateString: string): string {
		if (!dateString) return 'No Date';
		try {
			return new Date(dateString).toLocaleDateString('en-US', {
				month: 'short', // e.g., Apr
				day: 'numeric' // e.g., 15
				// year: 'numeric' // Optional: Add year if desired
			});
		} catch (e) {
			return 'Invalid Date';
		}
	}

	// Helper to get year
	function getYear(dateString: string): number {
		return new Date(dateString).getFullYear();
	}

	// Group entries by year for horizontal layout separators
	let groupedEntries: { [year: number]: DiaryEntry[] } = {};
	let sortedYears: number[] = [];

	$: {
		// Apply entry limit *before* grouping if layout is horizontal
		const entriesToProcess =
			layout === 'horizontal' && entryLimit !== null && entryLimit > 0
				? entries.slice(0, entryLimit)
				: entries;

		groupedEntries = entriesToProcess.reduce(
			(acc, entry) => {
				const year = getYear(entry.date);
				if (!acc[year]) {
					acc[year] = [];
				}
				acc[year].push(entry); // Keep original order within year
				return acc;
			},
			{} as { [year: number]: DiaryEntry[] }
		);
		// Sort years descending
		sortedYears = Object.keys(groupedEntries)
			.map(Number)
			.sort((a, b) => b - a);
	}

	// Scroll active item into view on mount/update
	$: if (browser && activeItemRef) {
		activeItemRef.scrollIntoView({
			behavior: 'smooth',
			block: layout === 'vertical' ? 'center' : 'nearest',
			inline: layout === 'horizontal' ? 'center' : 'nearest'
		});
	}
</script>

<!-- Apply wrapper class based on layout -->
<div
	bind:this={wrapperRef}
	class="timeline-wrapper"
	class:timeline-collapsed={layout === 'horizontal'}
	class:p-2={layout === 'horizontal'}
	class:overflow-y-auto={layout === 'vertical'}
	class:h-full={layout === 'vertical'}
	class:p-4={layout === 'vertical'}
>
	<!-- Use conditional classes for layout direction and spacing -->
	<!-- Restore horizontal flex layout -->
	<ul
		class:h-full={layout === 'vertical'}
		class:flex={layout === 'horizontal'}
		class:flex-row={layout === 'horizontal'}
		class:items-center={layout === 'horizontal'}
		class:pb-2={layout === 'horizontal'}
		class:space-y-4={layout === 'vertical'}
		class:space-x-0={layout === 'vertical'}
		style="position: relative;"
	>
		<!-- Floating active blob indicator -->
		{#if layout === 'horizontal' && activeItemRef}
			<div class="active-blob" style={blobStyle}></div>
		{/if}

		{#if entries.length > 0}
			{#if layout === 'horizontal'}
				<!-- Horizontal Layout: Iterate through sorted years and then entries within each year -->
				{#each sortedYears as year, yearIndex (year)}
					<!-- Render separator *before* each year group -->
					<li class="year-separator-horizontal flex-shrink-0" aria-hidden="true">
						<span class="year-text-horizontal">{year}</span>
					</li>

					{#each groupedEntries[year] as entry (entry.slug)}
						{@const isActive = entry.slug === currentSlug}
						{@const itemWidthClass = isActive ? 'w-44' : 'w-20 hover:w-36'}
						{@const linkPaddingClass = isActive ? 'p-3' : 'p-2 group-hover:p-3'}
						{@const linkJustifyClass = 'justify-start'}
						{@const dateAlignClass = 'text-center'}
						{@const titleOpacityClass = ''}

						<!-- Use unified element with morphing classes -->
						<li
							use:setActiveRef={isActive}
							class="timeline-item timeline-entry-morph group ml-2 flex-shrink-0 overflow-hidden rounded-md md:ml-4 {itemWidthClass}"
							class:entry-active={isActive}
							class:entry-inactive={!isActive}
						>
							<a
								href="/diary/{entry.slug}"
								class="relative block flex h-full flex-col {linkPaddingClass} {linkJustifyClass}"
							>
								<span
									class="timeline-date block whitespace-nowrap text-xs font-semibold {dateAlignClass}"
								>
									{formatDate(entry.date)}
								</span>
								<span
									class="timeline-title line-clamp-3 block text-sm font-semibold leading-tight {titleOpacityClass}"
								>
									{entry.title}
								</span>
							</a>
						</li>
					{/each}
				{/each}
			{:else}
				{#each entries as entry (entry.slug)}
					{@const isActive = entry.slug === currentSlug}
					{@const itemBaseClass = 'timeline-item transition-colors duration-200 rounded-md'}
					{@const itemLayoutClass = 'w-full'}
					{@const linkBaseClass = 'block p-3 h-full'}
					{@const linkLayoutClass = ''}

					{#if isActive}
						<li
							bind:this={activeItemRef}
							class="{itemBaseClass} {itemLayoutClass} border-l-4 border-yellow-400 bg-gray-800 text-white shadow-md"
						>
							<a href="/diary/{entry.slug}" class="{linkBaseClass} {linkLayoutClass}">
								<span class="mb-1 block text-base font-bold text-gray-300">
									{formatDate(entry.date)}
								</span>
								<span class="line-clamp-3 block text-sm font-semibold leading-tight">
									{entry.title}
								</span>
							</a>
						</li>
					{:else}
						<li
							class="{itemBaseClass} {itemLayoutClass} border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
						>
							<a href="/diary/{entry.slug}" class="{linkBaseClass} {linkLayoutClass}">
								<span
									class="mb-1 block text-base font-bold text-gray-500 group-hover:text-gray-600"
								>
									{formatDate(entry.date)}
								</span>
								<span class="line-clamp-3 block text-sm font-semibold leading-tight">
									{entry.title}
								</span>
							</a>
						</li>
					{/if}
				{/each}
			{/if}
		{:else}
			<li class="px-4 text-center italic text-gray-500">No diary entries found.</li>
		{/if}
	</ul>
</div>

<style>
	.timeline-wrapper {
		scrollbar-width: thin;
		scrollbar-color: #9ca3af #f3f4f6;
	}
	.timeline-wrapper::-webkit-scrollbar {
		height: 6px;
		width: 6px;
	}
	.timeline-wrapper::-webkit-scrollbar-track {
		background: #f3f4f6;
		border-radius: 3px;
	}
	.timeline-wrapper::-webkit-scrollbar-thumb {
		background-color: #9ca3af;
		border-radius: 3px;
	}
	.timeline-wrapper::-webkit-scrollbar-thumb:hover {
		background-color: #6b7280;
	}

	.timeline-collapsed {
		height: 100%;
		overflow-x: auto;
		overflow-y: hidden;
		scroll-behavior: smooth;
	}

	.timeline-collapsed .timeline-item,
	.timeline-collapsed .year-separator-horizontal {
		height: 48px;
		will-change: height, width;
		transition:
			height 0.45s cubic-bezier(0.22, 1, 0.36, 1),
			width 0.5s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.timeline-collapsed:hover .timeline-item,
	.timeline-collapsed:hover .year-separator-horizontal {
		height: 110px;
	}

	.timeline-collapsed .year-text-horizontal {
		font-size: 0.875rem;
		transition: font-size 0.35s cubic-bezier(0.4, 0, 0.2, 1);
	}
	.timeline-collapsed:hover .year-text-horizontal {
		font-size: 1.25rem;
	}

	.line-clamp-3 {
		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
	}

	.year-separator-horizontal {
		display: flex;
		align-items: center;
		padding: 0 0.75rem;
		position: relative;
	}
	.year-separator-horizontal::before {
		content: '';
		position: absolute;
		left: 0;
		top: 10%;
		bottom: 10%;
		width: 2px;
		background-color: #6b7280;
	}
	.year-text-horizontal {
		writing-mode: vertical-rl;
		transform: rotate(180deg);
		font-weight: 800;
		color: #374151;
		line-height: 1;
		letter-spacing: 0.05em;
		margin-left: 0.5rem;
		white-space: nowrap;
	}

	.timeline-entry-morph {
		position: relative;
		overflow: hidden;
		will-change: width, height, background-color;
		transition:
			background-color 0.3s,
			border-color 0.3s,
			width 0.4s cubic-bezier(0.4, 0, 0.2, 1),
			height 0.45s cubic-bezier(0.4, 0, 0.2, 1);
	}
	.timeline-entry-morph a {
		position: relative;
		z-index: 30;
	}

	.active-blob {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		height: 100%;
		background-color: #1f2937;
		border-left: 4px solid #facc15;
		border-radius: 0.375rem;
		z-index: 20;
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.2),
			0 4px 6px -2px rgba(0, 0, 0, 0.1);
		pointer-events: none;
		will-change: transform, width;
		transition:
			transform 0.5s cubic-bezier(0.22, 1, 0.36, 1),
			width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
			opacity 0.2s;
	}

	.timeline-entry-morph.entry-active {
		background-color: transparent !important;
		border: 1px solid transparent;
		color: white;
	}
	.timeline-entry-morph.entry-inactive {
		background-color: white;
		border: 1px solid #e5e7eb;
		color: #374151;
	}
	.timeline-entry-morph.entry-inactive:hover {
		background-color: #d1d5db;
	}

	.timeline-entry-morph.entry-active .timeline-date {
		color: #d1d5db;
	}
	.timeline-entry-morph.entry-inactive .timeline-date {
		color: #6b7280;
	}
	.timeline-entry-morph.entry-active .timeline-title {
		color: white;
	}
	.timeline-entry-morph.entry-inactive .timeline-title {
		color: #374151;
	}

	.timeline-collapsed .timeline-title {
		opacity: 0;
		max-height: 0;
		position: absolute;
		bottom: 0.5rem;
		left: 0;
		width: 100%;
		text-align: center;
		padding: 0 0.5rem;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
		word-break: break-word;
		line-height: 1.25;
		transition:
			opacity 0.3s,
			max-height 0.45s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.timeline-collapsed:hover .timeline-item:hover .timeline-title,
	.timeline-collapsed:hover .timeline-item.entry-active .timeline-title {
		opacity: 1;
		max-height: 5rem;
	}
</style>
