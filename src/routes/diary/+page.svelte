<script lang="ts">
	import type { LayoutData } from './$types';

	export let data: LayoutData;
	const entries = data.sortedEntries;

	function formatShortDate(dateString: string): string {
		if (!dateString) return '';
		try {
			return new Date(dateString).toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric'
			});
		} catch (e) {
			console.error('Invalid date format:', dateString);
			return 'Invalid Date';
		}
	}

	function getYear(dateString: string): number {
		return new Date(dateString).getFullYear();
	}
</script>

<svelte:head>
	<title>Diary - Bibek Bhatta</title>
	<meta name="description" content="A chronological collection of thoughts and updates from Bibek Bhatta." />
</svelte:head>

<div class="fixed left-0 top-0 h-screen flex flex-col items-center justify-center pl-10 md:pl-150 z-10 pointer-events-none">
	<span class="block text-5xl md:text-7xl lg:text-9xl font-bold text-gray-300 leading-none tracking-tighter">D</span>
	<span class="block text-5xl md:text-7xl lg:text-9xl font-bold text-gray-300 leading-none tracking-tighter">I</span>
	<span class="block text-5xl md:text-7xl lg:text-9xl font-bold text-gray-300 leading-none tracking-tighter">A</span>
	<span class="block text-5xl md:text-7xl lg:text-9xl font-bold text-gray-300 leading-none tracking-tighter">R</span>
	<span class="block text-5xl md:text-7xl lg:text-9xl font-bold text-gray-300 leading-none tracking-tighter">Y</span>
</div>
<div class="max-w-2xl mx-auto px-4 py-12 md:py-16 relative z-20">

	{#if entries.length > 0}
		<div class="relative timeline-container">
			<div class="timeline-line"></div>

			{#each entries as entry, i (entry.slug)}
				{@const currentYear = getYear(entry.date)}
				{@const previousYear = i > 0 ? getYear(entries[i - 1].date) : null}
				{@const showYearSeparator = i === 0 || currentYear !== previousYear}

				{#if showYearSeparator}
					<div class="year-separator">
						<span class="year-text">{currentYear}</span>
					</div>
				{/if}

				<div class="timeline-item group">
					<div class="timeline-dot"></div>

					<div class="timeline-date transition-colors duration-200 group-hover:text-gray-900">
						{formatShortDate(entry.date)}
					</div>

					<div class="timeline-content">
						<a href="/diary/{entry.slug}" class="block transition-opacity duration-200 hover:opacity-75">
							<h3 class="relative text-base sm:text-lg font-medium text-gray-900 mb-1 group-hover:text-black">
								<span>{entry.title}</span>
								<span
									class="absolute bottom-0 left-0 block h-0.5 bg-black w-full transform transition-transform duration-300 ease-out origin-left scale-x-0 group-hover:scale-x-100"
								></span>
							</h3>
							{#if entry.description}
								<p class="text-sm text-gray-700">
									{entry.description}
								</p>
							{/if}
						</a>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<p class="text-center text-gray-500 mt-10">No diary entries yet!</p>
	{/if}
</div>

<style>
	.timeline-container {
		position: relative;
	}

	.timeline-line {
		position: absolute;
		left: 4rem;
		top: 0;
		bottom: 0;
		width: 2px;
		background-color: #d1d5db;
		transform: translateX(-50%);
		z-index: 0;
	}

	.timeline-item {
		position: relative;
		display: flex;
		align-items: flex-start;
		margin-bottom: 2rem;
		padding-left: 5.5rem;
	}

	.timeline-dot {
		position: absolute;
		left: 4rem;
		top: 0.35rem;
		width: 10px;
		height: 10px;
		background-color: #ffffff;
		border: 2px solid #9ca3af;
		border-radius: 50%;
		transform: translateX(-50%);
		z-index: 1;
		transition: background-color 0.2s;
	}
	.timeline-item:hover .timeline-dot {
		background-color: #9ca3af;
	}

	.timeline-date {
		position: absolute;
		left: 0;
		top: 0.15rem;
		width: 3.5rem;
		text-align: right;
		font-size: 0.875rem;
		line-height: 1.25rem;
		color: #6b7280;
		padding-right: 0.5rem;
	}

	.year-separator {
		position: relative;
		margin-top: 3rem;
		margin-bottom: 2.5rem;
		text-align: center;
		z-index: 1;
	}

	.year-separator::before {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		top: 50%;
		height: 2px;
		background-color: #ffffff;
		z-index: -1;
	}

	.year-text {
		display: inline-block;
		background-color: #ffffff;
		padding: 0 1rem;
		font-weight: 700;
		color: #4b5563;
		font-size: 1.5rem;
		line-height: 2rem;
		letter-spacing: 0.025em;
	}

	.timeline-container > :first-child {
		margin-top: 0;
	}
	.timeline-container > :last-child {
		margin-bottom: 0;
	}

</style>
