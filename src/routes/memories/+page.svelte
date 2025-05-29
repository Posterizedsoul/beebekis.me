<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';

	export let data: PageData; // Receives groupedMemoirs and sortedKeys

	onMount(() => {
		console.log('PageData received in memories component:', JSON.stringify(data, null, 2));
		// Specifically log sortedKeys to check for the presence of 2025 data
		if (data.sortedKeys) {
			console.log('Sorted Keys:', JSON.stringify(data.sortedKeys, null, 2));
		} else {
			console.log('data.sortedKeys is undefined or null');
		}

		// Debug gallery previews for each memoir
		if (data.groupedMemoirs) {
			Object.entries(data.groupedMemoirs).forEach(([year, yearData]) => {
				Object.entries(yearData).forEach(([month, monthData]) => {
					Object.entries(monthData).forEach(([day, dayMemoirs]) => {
						dayMemoirs.forEach((memoir) => {
							console.log(
								`[Debug] ${memoir.slug} has ${memoir.galleryPreviews?.length || 0} preview images:`,
								memoir.galleryPreviews?.map((p) => p.filename)
							);
						});
					});
				});
			});
		}
	});

	// Keep the detailed date format for the card itself
	function formatCardDate(dateString: string): string {
		if (!dateString) return 'No date';
		try {
			return new Date(dateString).toLocaleDateString('en-US', {
				month: 'long',
				day: 'numeric',
				year: 'numeric'
			});
		} catch (e) {
			return 'Invalid date';
		}
	}

	// Format month number (0-11) to month name
	function formatMonthName(monthIndex: number): string {
		const date = new Date();
		date.setMonth(monthIndex);
		return date.toLocaleDateString('en-US', { month: 'long' }); // e.g., April
	}
</script>

<svelte:head>
	<title>Memories</title>
	<meta name="description" content="Collections of memories and moments." />
</svelte:head>

<section class="memories-landing-container mx-auto max-w-6xl px-4 py-8 md:py-16">
	<!-- You could add a temporary debug output here if needed -->
	<!-- <pre>Debug Sorted Keys: {JSON.stringify(data.sortedKeys, null, 2)}</pre> -->
	{#if data.sortedKeys && data.sortedKeys.years.length > 0}
		<!-- Outer loop for years -->
		{#each data.sortedKeys.years as year (year)}
			{#if data.sortedKeys.months[year] && data.sortedKeys.months[year].length > 0}
				<!-- Loop through months within the year -->
				{#each data.sortedKeys.months[year] as month (month)}
					{#if data.sortedKeys.days[year]?.[month] && data.sortedKeys.days[year][month].length > 0}
						<!-- Loop through days within the month -->
						{#each data.sortedKeys.days[year][month] as day (day)}
							<section class="relative mb-8 pt-16 md:mb-10 md:pt-20">
								<!-- Combined Sticky Year/Month/Day Heading -->
								<h2
									class="absolute left-0 right-0 top-0 z-20 border-b border-gray-200 bg-white/90 px-4 py-3 text-2xl
                           font-semibold text-gray-600 backdrop-blur-sm md:text-3xl"
								>
									<span class="mr-2 font-bold text-gray-300">{year}</span>
									{formatMonthName(month)}
									{day}
								</h2>

								{#if data.groupedMemoirs[year]?.[month]?.[day] && data.groupedMemoirs[year][month][day].length > 0}
									<!-- List of Memoir Cards for the specific day -->
									<!-- Use grid for overall card layout -->
									<ul class="grid grid-cols-1 gap-6 pl-4 md:grid-cols-1 md:gap-8 md:pl-8">
										{#each data.groupedMemoirs[year][month][day] as memoir (memoir.slug)}
											{@const previews = (memoir.galleryPreviews || []).slice(0, 5)}
											<!-- Card Item -->
											<li class="flex">
												<a
													href="/memories/{memoir.slug}"
													class="multi-image-card group relative block aspect-[16/9] w-full overflow-hidden rounded-lg border border-gray-100 shadow-md transition-all duration-300 ease-in-out hover:border-gray-200 hover:shadow-lg"
													style="text-decoration: none;"
												>
													<!-- Background Image Container -->
													<div class="absolute inset-0 flex h-full w-full">
														{#if previews.length > 0}
															{#each previews as preview, i (preview.src)}
																<div class="relative h-full flex-1 overflow-hidden">
																	<enhanced:img
																		src={preview.src}
																		alt=""
																		class="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
																		loading="lazy"
																		sizes="(min-width: 768px) {Math.round(
																			100 / previews.length
																		)}vw, {Math.round(100 / previews.length)}vw"
																	/>
																	{#if i < previews.length - 1}
																		<div
																			class="absolute bottom-0 right-0 top-0 z-10 w-px bg-white/20"
																		></div>
																	{/if}
																</div>
															{/each}
														{:else}
															<!-- Fallback if no images -->
															<div
																class="absolute inset-0 flex items-center justify-center bg-gray-100 text-sm text-gray-400"
															>
																<span>No Images</span>
															</div>
														{/if}
													</div>

													<!-- Content Overlay -->
													<div
														class="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 text-white md:p-5"
													>
														<h3
															class="text-shadow card-title-clamp mb-1 text-lg font-semibold md:text-xl"
														>
															{memoir.title}
														</h3>
														<p class="text-shadow mb-2 text-xs text-gray-300">
															{formatCardDate(memoir.date)}
														</p>
														{#if memoir.description}
															<p class="text-shadow card-description-clamp text-sm text-gray-200">
																{memoir.description}
															</p>
														{/if}
													</div>
												</a>
											</li>
										{/each}
									</ul>
								{:else}
									<p class="italic text-gray-500">No memoirs found for this day.</p>
								{/if}
							</section>
						{/each}
					{:else}
						<!-- This case might occur if a month has no days with entries, though unlikely with current logic -->
					{/if}
				{/each}
			{:else}
				<p class="pl-4 italic text-gray-500 md:pl-8">No entries found for {year}.</p>
			{/if}
		{/each}
	{:else}
		<p class="text-center text-gray-500">No memories found yet.</p>
	{/if}
</section>

<style>
	/* Make the combined header sticky */
	section > h2 {
		position: sticky;
		top: 0;
	}

	/* Add text shadow utility */
	.text-shadow {
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
	}

	/* Ensure aspect ratio is maintained */
	.multi-image-card {
		aspect-ratio: 16 / 9; /* Changed from 3/2 to 16/9 for a wider rectangle */
	}

	ul.grid,
	ul {
		list-style: none;
		padding-left: 0;
	}

	/* Add global selector for enhanced image within the card */
	.multi-image-card :global(img) {
		/* Ensure the image covers its container */
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease-in-out;
	}
	.multi-image-card:hover :global(img) {
		transform: scale(1.05);
	}
</style>
