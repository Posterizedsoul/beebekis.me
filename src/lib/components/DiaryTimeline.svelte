<script lang="ts">
	import type { DiaryEntry } from '$lib/types'; // Assuming types are defined here
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	export let entries: DiaryEntry[] = [];
	export let currentSlug: string | null = null;
	export let layout: 'vertical' | 'horizontal' = 'vertical';
	export let entryLimit: number | null = 30; // Limit for horizontal layout (null for no limit)

	let activeItemRef: HTMLElement | null = null;

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

		groupedEntries = entriesToProcess.reduce((acc, entry) => {
			const year = getYear(entry.date);
			if (!acc[year]) {
				acc[year] = [];
			}
			acc[year].push(entry); // Keep original order within year
			return acc;
		}, {} as { [year: number]: DiaryEntry[] });
		// Sort years descending
		sortedYears = Object.keys(groupedEntries).map(Number).sort((a, b) => b - a);
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
<!-- Restore overflow-x-auto for horizontal -->
<div
	class="timeline-wrapper h-full"
	class:p-2={layout === 'horizontal'}
	class:overflow-x-auto={layout === 'horizontal'}
	class:overflow-y-auto={layout === 'vertical'}
	class:p-4={layout === 'vertical'}
>
	<!-- Use conditional classes for layout direction and spacing -->
	<!-- Restore horizontal flex layout -->
	<ul
		class="h-full"
		class:flex={layout === 'horizontal'}
		class:flex-row={layout === 'horizontal'}
		class:items-center={layout === 'horizontal'}
		class:pb-2={layout === 'horizontal'}
		class:space-y-4={layout === 'vertical'}
		class:space-x-0={layout === 'vertical'}
	>
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
						{@const itemBaseClass =
							'group timeline-item transition-[width,background-color] duration-300 ease-out rounded-md overflow-hidden flex-shrink-0 h-[calc(100%-1rem)]'}
						{@const itemWidthClass = isActive ? 'w-40' : 'w-16 hover:w-40'}
						{@const linkPaddingClass = isActive ? 'p-3' : 'p-2 group-hover:p-3'}
						{@const linkJustifyClass = isActive ? 'justify-between' : 'justify-center group-hover:justify-between'}
						{@const dateAlignClass = isActive ? 'text-left mb-1' : 'text-center mb-0 group-hover:text-left group-hover:mb-1'}
						{@const titleOpacityClass = isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}

						{#if isActive}
							<li
								bind:this={activeItemRef}
								class="{itemBaseClass} {itemWidthClass} bg-gray-800 text-white shadow-md ml-2 md:ml-4"
							>
								<a href="/diary/{entry.slug}" class="block h-full flex flex-col {linkPaddingClass} {linkJustifyClass}">
									<span class="block text-sm font-semibold {dateAlignClass} text-gray-300 transition-colors duration-200">
										{formatDate(entry.date)}
									</span>
									<!-- Apply title styles directly, transition only opacity -->
									<span
										class="block text-sm font-semibold leading-tight line-clamp-3 {titleOpacityClass} transition-opacity duration-200 ease-out"
									>
										{entry.title}
									</span>
								</a>
							</li>
						{:else}
							<li
								class="{itemBaseClass} {itemWidthClass} bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 ml-2 md:ml-4"
							>
								<a href="/diary/{entry.slug}" class="block h-full flex flex-col {linkPaddingClass} {linkJustifyClass}">
									<span class="block text-sm font-semibold {dateAlignClass} text-gray-500 transition-colors duration-200">
										{formatDate(entry.date)}
									</span>
									<span
										class="block text-sm font-semibold leading-tight line-clamp-3 {titleOpacityClass} transition-opacity duration-200 ease-out"
									>
										{entry.title}
									</span>
								</a>
							</li>
						{/if}
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
							class="{itemBaseClass} {itemLayoutClass} bg-gray-800 text-white shadow-md"
						>
							<a href="/diary/{entry.slug}" class="{linkBaseClass} {linkLayoutClass}">
								<span class="block text-base font-bold mb-1 text-gray-200">
									{formatDate(entry.date)}
								</span>
								<span class="block text-sm font-semibold leading-tight line-clamp-3">
									{entry.title}
								</span>
							</a>
						</li>
					{:else}
						<li
							class="{itemBaseClass} {itemLayoutClass} bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
						>
							<a href="/diary/{entry.slug}" class="{linkBaseClass} {linkLayoutClass}">
								<span class="block text-base font-bold mb-1 text-gray-500 group-hover:text-gray-600">
									{formatDate(entry.date)}
								</span>
								<span class="block text-sm font-semibold leading-tight line-clamp-3">
									{entry.title}
								</span>
							</a>
						</li>
					{/if}
				{/each}
			{/if}
		{:else}
			<li class="text-center text-gray-500 italic px-4">No diary entries found.</li>
		{/if}
	</ul>
</div>

<style>
	/* Common wrapper styles */
	.timeline-wrapper {
		scrollbar-width: thin; /* Firefox */
		scrollbar-color: var(--tw-color-gray-400) var(--tw-color-gray-100); /* Firefox */
	}
	.timeline-wrapper::-webkit-scrollbar {
		height: 6px; /* Default height (for horizontal) */
		width: 6px; /* Default width (for vertical) */
	}
	.timeline-wrapper::-webkit-scrollbar-track {
		background: var(--tw-color-gray-100);
		border-radius: 3px;
	}
	.timeline-wrapper::-webkit-scrollbar-thumb {
		background-color: var(--tw-color-gray-400);
		border-radius: 3px;
	}
	.timeline-wrapper::-webkit-scrollbar-thumb:hover {
		background-color: var(--tw-color-gray-500);
	}

	/* Restore horizontal scrollbar height adjustment */
	.timeline-wrapper.overflow-x-auto::-webkit-scrollbar {
		height: 6px;
		width: auto; /* Reset width if needed */
	}
	/* Adjust scrollbar width only for vertical layout */
	.timeline-wrapper.overflow-y-auto::-webkit-scrollbar {
		width: 6px;
		height: auto; /* Reset height if needed */
	}

	/* Add line-clamp utility if not globally available */
	.line-clamp-3 {
		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
	}

	/* Horizontal Year Separator Styles */
	.year-separator-horizontal {
		display: flex;
		align-items: center; /* Vertically center content */
		height: calc(100% - 1rem); /* Match item height */
		padding: 0 2rem; /* Increased padding for larger text */
		/* Removed margin-left, spacing handled by item margin */
		position: relative;
	}
	.year-separator-horizontal::before {
		content: '';
		position: absolute;
		left: 0;
		top: 10%; /* Adjust vertical position */
		bottom: 10%; /* Adjust vertical position */
		width: 2px; /* Line width */
		background-color: #6b7280; /* gray-500 - Slightly darker line */
	}
	.year-text-horizontal {
		writing-mode: vertical-rl; /* Vertical text */
		transform: rotate(180deg); /* Correct orientation */
		font-weight: 800; /* Extra-bold */
		color: #374151; /* gray-700 - Darker text */
		font-size: 1.5rem; /* Significantly larger text (adjust as needed) */
		line-height: 1; /* Adjust line height for vertical text */
		letter-spacing: 0.15em; /* Increased spacing */
		margin-left: 0.75rem; /* Increased space between line and text */
		white-space: nowrap;
	}
</style>
