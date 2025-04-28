<script lang="ts">
    import type { PageData } from './$types';

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

<div class="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
    <!-- Optional: Add a main heading for the blog section if desired -->
    <!-- <h1 class="text-2xl sm:text-3xl font-semibold mb-10 sm:mb-12 text-center text-gray-800">Articles</h1> -->

    {#if data.sortedYears && data.sortedYears.length > 0}
        <!-- Outer loop for years -->
        {#each data.sortedYears as year (year)}
            <!-- Section for each year using flexbox -->
            <section class="mb-12 md:mb-16 flex flex-col md:flex-row md:gap-8 lg:gap-12 items-start">
                <!-- Year Heading (Sidebar) - Changed text color -->
                <div class="md:w-1/4 lg:w-1/5 mb-4 md:mb-0 md:sticky md:top-20">
                    <h2 class="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-600">{year}</h2>
                </div>

                <!-- Post List (Main content for the year) -->
                <div class="w-full md:w-3/4 lg:w-4/5">
                    <ul class="space-y-8 sm:space-y-10">
                        {#each data.groupedPosts[year] as post (post.slug)}
                            {@const formatted = formatDate(post.date)}
                            <li class="flex flex-col sm:flex-row gap-4 sm:gap-6 group">
                                <!-- Date Column - Updated Font Sizes -->
                                <div class="flex-shrink-0 sm:w-32 flex sm:flex-col items-baseline sm:items-center pt-1"> 
                                    <span class="text-base font-medium text-gray-500 group-hover:text-orange-600 transition-colors duration-300 sm:mb-0 sm:text-center w-full">
                                        {formatted.month}
                                    </span>
                                    <span class="text-6xl font-bold text-gray-700 group-hover:text-orange-600 transition-colors duration-300 leading-none">
                                        {formatted.day}
                                    </span>
                                </div>

                                <!-- Main Post Content Area -->
                                <div class="flex-grow relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 {post.resolvedImageUrl ? '' : 'bg-gray-50'}">
                                    <!-- Background Image Div -->
                                    {#if post.resolvedImageUrl}
                                        <div
                                            class="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                                            style="background-image: url('{post.resolvedImageUrl}')"
                                        ></div>
                                        <!-- Darker Overlay for Readability -->
                                        <div
                                            class="absolute inset-0 z-1 bg-black/50 group-hover:bg-black/40 transition-colors duration-300"
                                        ></div>
                                    {/if}

                                    <!-- Link container -->
                                    <a href="/blog/{post.slug}" class="block pt-4 pb-2 px-4 relative z-10">
                                        <div class:text-white={post.resolvedImageUrl}>
                                            <h3
                                                class="text-lg sm:text-xl font-medium transition-colors {post.resolvedImageUrl
                                                    ? 'group-hover:text-gray-200 text-shadow'
                                                    : 'text-gray-800 group-hover:text-black'}"
                                            >
                                                {post.title}
                                            </h3>
                                        </div>
                                    </a>
                                    <!-- Description -->
                                    {#if post.description}
                                        <div class="px-4 pb-6 pt-0 relative z-10">
                                            <p class="text-xs {post.resolvedImageUrl ? 'text-gray-200 opacity-90 text-shadow-sm' : 'text-gray-600'}">
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
        text-shadow: 0 1px 3px rgba(0,0,0,0.5);
    }
    .text-shadow-sm {
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
</style>