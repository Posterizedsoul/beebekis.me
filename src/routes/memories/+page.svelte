<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData; // Receives groupedMemoirs and sortedKeys

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

<section class="memories-landing-container max-w-6xl mx-auto px-4 py-8 md:py-16">
	{#if data.sortedKeys && data.sortedKeys.years.length > 0}
		<!-- Outer loop for years -->
		{#each data.sortedKeys.years as year (year)}
			{#if data.sortedKeys.months[year] && data.sortedKeys.months[year].length > 0}
				<!-- Loop through months within the year -->
				{#each data.sortedKeys.months[year] as month (month)}
					{#if data.sortedKeys.days[year]?.[month] && data.sortedKeys.days[year][month].length > 0}
						<!-- Loop through days within the month -->
						{#each data.sortedKeys.days[year][month] as day (day)}
							<section class="mb-8 md:mb-10 relative pt-16 md:pt-20">
								<!-- Combined Sticky Year/Month/Day Heading -->
								<h2
									class="absolute top-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-sm py-3 px-4 border-b border-gray-200
                           text-2xl md:text-3xl font-semibold text-gray-600"
								>
									<span class="text-gray-300 font-bold mr-2">{year}</span>
									{formatMonthName(month)} {day}
								</h2>

								{#if data.groupedMemoirs[year]?.[month]?.[day] && data.groupedMemoirs[year][month][day].length > 0}
									<!-- List of Memoir Cards for the specific day -->
									<!-- Use grid for overall card layout -->
									<ul class="grid grid-cols-1 md:grid-cols-1 gap-6 md:gap-8 pl-4 md:pl-8">
										{#each data.groupedMemoirs[year][month][day] as memoir (memoir.slug)}
											{@const previews = (memoir.galleryPreviews || []).slice(0, 5)}
											<!-- Card Item -->
											<li class="flex">
												<a
													href="/memories/{memoir.slug}"
													class="multi-image-card group relative block w-full aspect-[3/2] rounded-lg shadow-md overflow-hidden border border-gray-100 transition-all duration-300 ease-in-out hover:shadow-lg hover:border-gray-200"
													style="text-decoration: none;"
												>
													<!-- Background Image Container -->
													<div class="absolute inset-0 flex w-full h-full">
														{#if previews.length > 0}
															{#each previews as preview, i (preview.src)}
																<div class="relative flex-1 h-full overflow-hidden">
																	<img
																		src={preview.src}
																		
																		alt=""
																		class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
																		loading="lazy"
																	/>
																	<!-- Alt handled by main card link/content -->
																	{#if i < previews.length - 1}
																		<div class="absolute top-0 right-0 bottom-0 w-px bg-white/20 z-10"></div>
																	{/if}
																</div>
															{/each}
														{:else}
															<!-- Fallback if no images -->
															<div class="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
																<span>No Images</span>
															</div>
														{/if}
													</div>

													<!-- Content Overlay -->
													<div class="absolute inset-0 flex flex-col justify-end p-4 md:p-5 bg-gradient-to-t from-black/80 via-black/50 to-transparent text-white">
														<h3 class="text-lg md:text-xl font-semibold mb-1 text-shadow card-title-clamp">
															{memoir.title}
														</h3>
														<p class="text-xs text-gray-300 mb-2 text-shadow">{formatCardDate(memoir.date)}</p>
														{#if memoir.description}
															<p class="text-sm text-gray-200 text-shadow card-description-clamp">{memoir.description}</p>
														{/if}
													</div>
												</a>
											</li>
										{/each}
									</ul>
								{:else}
									<p class="text-gray-500 italic">No memoirs found for this day.</p>
								{/if}
							</section>
						{/each}
					{:else}
						<!-- This case might occur if a month has no days with entries, though unlikely with current logic -->
					{/if}
				{/each}
			{:else}
				<p class="text-gray-500 italic pl-4 md:pl-8">No entries found for {year}.</p>
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
		text-shadow: 0 1px 3px rgba(0,0,0,0.6);
	}

	/* Ensure aspect ratio is maintained */
	.multi-image-card {
		aspect-ratio: 16 / 9; /* Changed from 3/2 to 16/9 for a wider rectangle */
	}

	ul.grid, ul {
		list-style: none;
		padding-left: 0;
	}
</style>
