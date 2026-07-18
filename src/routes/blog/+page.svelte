<script lang="ts">
	import type { PageData } from './$types';
	import AdminAddButton from '$lib/components/AdminAddButton.svelte';

	export let data: PageData; // Receives groupedPosts and sortedYears

	// Updated to return an object with month and day
	function formatDate(dateString: string): { month: string; day: string } {
		const date = new Date(dateString);
		return {
			month: date.toLocaleDateString('en-US', { month: 'long' }), // e.g., November
			day: date.toLocaleDateString('en-US', { day: 'numeric' }) // e.g., 24
		};
	}
</script>

<div class="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
	<div class="mb-8 flex justify-end">
		<AdminAddButton kind="blog" label="Add Blog Post" />
	</div>
	<!-- Optional: Add a main heading for the blog section if desired -->
	<!-- <h1 class="text-2xl sm:text-3xl font-semibold mb-10 sm:mb-12 text-center text-gray-800">Articles</h1> -->

	{#if data.sortedYears && data.sortedYears.length > 0}
		<!-- Outer loop for years -->
		{#each data.sortedYears as year (year)}
			<!-- Section for each year using flexbox -->
			<section class="mb-12 flex flex-col items-start md:mb-16 md:flex-row md:gap-8 lg:gap-12">
				<!-- Year Heading (Sidebar) - Changed text color -->
				<div class="mb-4 md:sticky md:top-20 md:mb-0 md:w-1/4 lg:w-1/5">
					<h2 class="text-4xl font-bold text-gray-600 md:text-5xl lg:text-6xl">{year}</h2>
				</div>

				<!-- Post List (Main content for the year) -->
				<div class="w-full md:w-3/4 lg:w-4/5">
					<ul class="space-y-8 sm:space-y-10">
						{#each data.groupedPosts[year] as post (post.slug)}
							{@const formatted = formatDate(post.date)}
							<li class="group flex flex-col gap-4 sm:flex-row sm:gap-6">
								<!-- Date Column - Updated Font Sizes -->
								<div
									class="flex flex-shrink-0 items-baseline pt-1 sm:w-32 sm:flex-col sm:items-center"
								>
									<span
										class="w-full text-base font-medium text-gray-500 transition-colors duration-300 group-hover:text-orange-600 sm:mb-0 sm:text-center"
									>
										{formatted.month}
									</span>
									<span
										class="text-6xl leading-none font-bold text-gray-700 transition-colors duration-300 group-hover:text-orange-600"
									>
										{formatted.day}
									</span>
								</div>

								<!-- Main Post Content Area -->
								<div
									class="relative flex-grow overflow-hidden rounded-lg shadow-md transition-shadow duration-300 hover:shadow-lg {post.featuredImage
										? ''
										: 'bg-gray-50'}"
								>
									<!-- Background Image Div -->
									{#if post.featuredImage}
										<div
											class="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
											style="background-image: url('{post.featuredImage}')"
										></div>
										<!-- Darker Overlay for Readability -->
										<div
											class="absolute inset-0 z-1 bg-black/50 transition-colors duration-300 group-hover:bg-black/40"
										></div>
									{/if}

									<!-- Link container -->
									<a href="/blog/{post.slug}" class="relative z-10 block px-4 pt-4 pb-2">
										<div class:text-white={post.featuredImage}>
											<h3
												class="text-lg font-medium transition-colors sm:text-xl {post.featuredImage
													? 'text-shadow group-hover:text-gray-200'
													: 'text-gray-800 group-hover:text-black'}"
											>
												{post.title}
											</h3>
										</div>
									</a>
									<!-- Description -->
									{#if post.description}
										<div class="relative z-10 px-4 pt-0 pb-6">
											<p
												class="text-xs {post.featuredImage
													? 'text-gray-200 opacity-90 text-shadow-sm'
													: 'text-gray-600'}"
											>
												{post.description}
											</p>
										</div>
									{/if}
								</div>
							</li>
						{/each}
					</ul>
				</div>
			</section>
		{/each}
	{:else}
		<p class="text-center">No blog posts yet!</p>
	{/if}
</div>

<style>
	/* Add text-shadow utilities if not globally defined */
	.text-shadow {
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
	}
	.text-shadow-sm {
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}
</style>
