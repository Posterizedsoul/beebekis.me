<script lang="ts">
	import type { PageData } from './$types';
	import AdminAddButton from '$lib/components/AdminAddButton.svelte';
	import ProjectContent from '$lib/components/ProjectContent.svelte';
	import { X, ChevronDown } from 'lucide-svelte';
	import { browser } from '$app/environment';
	import { auth } from '$lib/firebase';
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';

	export let data: PageData;
	$: entries = data.sortedEntries;

	let selectedSlug: string | null = null;
	let readerScroller: HTMLElement | undefined;
	let railEl: HTMLElement | undefined;
	let railHasMore = false;

	// For the sliding blob animation in the rail
	let activeRailRef: HTMLElement | null = null;
	let blobTop = 0;
	let blobHeight = 0;

	function updateBlob() {
		if (activeRailRef) {
			blobTop = activeRailRef.offsetTop;
			blobHeight = activeRailRef.offsetHeight;
		}
	}

	function setActiveRailRef(node: HTMLElement, isActive: boolean) {
		if (isActive) {
			activeRailRef = node;
			updateBlob();
		}
		return {
			update(newIsActive: boolean) {
				if (newIsActive) {
					activeRailRef = node;
					updateBlob();
				}
			}
		};
	}

	function updateRailMore() {
		railHasMore = !!railEl && railEl.scrollHeight - railEl.scrollTop - railEl.clientHeight > 8;
	}

	// Re-check the "more below" hint whenever the reader opens or switches
	$: if (browser && selectedSlug) {
		setTimeout(() => {
			updateRailMore();
			updateBlob();
		}, 80);
	}

	$: selected = entries.find((e) => e.slug === selectedSlug) ?? null;

	// Lock page scroll while the reader is open
	$: if (browser) {
		document.body.style.overflow = selectedSlug ? 'hidden' : '';
	}

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

	function formatFullDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric'
		});
	}

	// Entry click opens the popup reader; modifier-clicks still open the real page
	function openEntry(e: MouseEvent, slug: string) {
		if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
		e.preventDefault();
		selectEntry(slug);
	}

	function selectEntry(slug: string) {
		selectedSlug = slug;
		if (readerScroller) readerScroller.scrollTop = 0;
	}

	function closeReader() {
		selectedSlug = null;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') closeReader();
	}

	// --- Auth & inline edit ---
	let isLoggedIn = false;
	let composerOpen = false;
	let editingId = '';
	let Composer: typeof import('$lib/components/EntryComposer.svelte').default | null = null;

	onMount(() => {
		const unsubscribe = auth.onAuthStateChanged((user: unknown) => {
			isLoggedIn = !!user;
		});
		return unsubscribe;
	});

	async function openEditor(docId: string) {
		if (!Composer) {
			Composer = (await import('$lib/components/EntryComposer.svelte')).default;
		}
		editingId = docId;
		composerOpen = true;
	}

	function handleEditorClose() {
		composerOpen = false;
		invalidateAll();
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<svelte:head>
	<title>Diary - Bibek Bhatta</title>
	<meta
		name="description"
		content="A chronological collection of thoughts and updates from Bibek Bhatta."
	/>
	<!-- Personal diary: kept out of search -->
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div
	class="pointer-events-none fixed top-0 left-0 z-10 hidden h-screen flex-col items-center justify-center pl-10 md:pl-20 xl:flex"
>
	<span
		class="block text-5xl leading-none font-bold tracking-tighter text-gray-300 md:text-7xl lg:text-9xl"
		>D</span
	>
	<span
		class="block text-5xl leading-none font-bold tracking-tighter text-gray-300 md:text-7xl lg:text-9xl"
		>I</span
	>
	<span
		class="block text-5xl leading-none font-bold tracking-tighter text-gray-300 md:text-7xl lg:text-9xl"
		>A</span
	>
	<span
		class="block text-5xl leading-none font-bold tracking-tighter text-gray-300 md:text-7xl lg:text-9xl"
		>R</span
	>
	<span
		class="block text-5xl leading-none font-bold tracking-tighter text-gray-300 md:text-7xl lg:text-9xl"
		>Y</span
	>
</div>
<div class="relative z-20 mx-auto max-w-2xl px-4 py-12 md:py-16">
	<div class="mb-6 flex justify-end">
		<AdminAddButton kind="diary" label="Add Diary Entry" />
	</div>
	{#if entries.length > 0}
		<div class="timeline-container relative">
			<div class="timeline-line"></div>

			{#each entries as entry, i (entry.id)}
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
						<a
							href="/diary/{entry.slug}"
							class="block transition-opacity duration-200 hover:opacity-75"
							on:click={(e) => openEntry(e, entry.slug)}
						>
							<h3
								class="relative mb-1 text-base font-medium text-gray-900 group-hover:text-black sm:text-lg"
							>
								<span>{entry.title}</span>
								<span
									class="absolute bottom-0 left-0 block h-0.5 w-full origin-left scale-x-0 transform bg-black transition-transform duration-300 ease-out group-hover:scale-x-100"
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
		<p class="mt-10 text-center text-gray-500">No diary entries yet!</p>
	{/if}
</div>

<!-- ============ Entry reader (Prime-style popup) ============ -->
{#if selected}
	<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
	<div class="overlay-backdrop fixed inset-0 z-[80]" on:click={closeReader}></div>

	<div
		class="pointer-events-none fixed inset-0 z-[85] flex items-center justify-center gap-4 p-3 md:p-8"
	>
		<!-- Spacer mirrors the rail so the panel sits dead-center -->
		<div class="hidden w-64 flex-shrink-0 lg:block" aria-hidden="true"></div>

		<div
			class="overlay-panel pointer-events-auto relative flex h-[88vh] w-full max-w-7xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
		>
			<button
				type="button"
				on:click={closeReader}
				class="absolute top-3 right-3 z-20 cursor-pointer rounded-full bg-white/90 p-2 text-gray-600 shadow-md backdrop-blur transition-colors hover:bg-gray-100 hover:text-black"
				aria-label="Close"
			>
				<X size={18} />
			</button>

			<div class="no-scrollbar flex-1 overflow-y-auto" bind:this={readerScroller}>
				<!-- Hero: image in the back, date in front -->
				{#if selected.featuredImage}
					<div class="relative mb-8">
						<img
							src={selected.featuredImage}
							alt={selected.title}
							class="h-56 w-full object-cover md:h-72"
							loading="lazy"
							decoding="async"
						/>
						<div
							class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
						></div>
						<div class="pointer-events-none absolute right-0 bottom-0 left-0 p-6 md:p-8">
							<h1 class="text-shadow font-serif text-3xl font-bold text-white md:text-4xl">
								{formatFullDate(selected.date)}
							</h1>
							{#if selected.title}
								<p class="text-shadow mt-2 text-gray-200">{selected.title}</p>
							{/if}
						</div>
					</div>
				{/if}

				<div class="px-6 pb-10 md:px-12 {selected.featuredImage ? '' : 'pt-10'}">
					{#if !selected.featuredImage}
						<header class="mb-6 text-center">
							<h1 class="font-serif text-3xl font-bold text-gray-900 md:text-5xl">
								{formatFullDate(selected.date)}
							</h1>
							{#if selected.title}
								<p class="mt-3 text-lg text-gray-600">{selected.title}</p>
							{/if}
						</header>
					{/if}

					<!-- Action bar -->
					<div class="mb-8 flex items-center justify-between border-b border-gray-200 pb-4">
						<button
							type="button"
							on:click={closeReader}
							class="cursor-pointer text-sm font-medium text-gray-500 transition-colors hover:text-black hover:underline"
						>
							← All Entries
						</button>
						<div class="flex items-center gap-4">
							{#if isLoggedIn && selected.id}
								<button
									type="button"
									on:click={() => openEditor(selected.id)}
									class="group relative inline-block cursor-pointer pb-1 text-sm font-medium text-gray-500 transition-colors hover:text-black"
								>
									<span>✏️ Edit</span>
									<span
										class="absolute bottom-0 left-0 block h-[1.5px] w-full origin-left scale-x-0 transform bg-black transition-transform duration-300 ease-out group-hover:scale-x-100"
									></span>
								</button>
							{/if}
							<a
								href="/diary/{selected.slug}"
								class="cursor-pointer text-sm font-medium text-gray-500 transition-colors hover:text-black hover:underline"
							>
								Open full page ↗
							</a>
						</div>
					</div>

					{#if selected.contentHtml}
						<ProjectContent html={selected.contentHtml} />
					{:else}
						<p class="text-center text-gray-500 italic">Nothing written for this day.</p>
					{/if}
				</div>
			</div>
		</div>

		<!-- Floating rail of entries, on the side of the panel -->
		<div class="relative hidden w-64 flex-shrink-0 lg:block">
			<aside
				bind:this={railEl}
				on:scroll={updateRailMore}
				class="no-scrollbar pointer-events-auto max-h-[88vh] overflow-y-auto"
			>
				<p
					class="rail-label mb-3 font-serif text-xs font-semibold tracking-widest text-white/80 uppercase"
				>
					Entries
				</p>
				<nav class="relative z-0 space-y-2 pr-1">
					<!-- Active sliding blob -->
					<div
						class="pointer-events-none absolute top-0 left-0 z-0 w-[calc(100%-0.25rem)] rounded-md border-l-4 border-yellow-400 bg-gray-800 shadow-lg"
						style="transform: translateY({blobTop}px); height: {blobHeight}px; opacity: {blobHeight >
						0
							? 1
							: 0}; transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), height 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s; will-change: transform, height;"
					></div>

					{#each entries as entry, i (entry.slug)}
						{@const isActive = entry.slug === selectedSlug}
						<button
							type="button"
							use:setActiveRailRef={isActive}
							on:click={() => selectEntry(entry.slug)}
							style="animation-delay: {i * 45}ms"
							class="rail-item diary-pill relative z-10 block w-full cursor-pointer rounded-md px-3 py-2 text-left transition-colors duration-300 {isActive
								? 'border border-transparent text-white shadow-none'
								: 'border border-gray-200 bg-white/95 text-gray-700 opacity-80 shadow-sm hover:bg-gray-100 hover:opacity-100'}"
						>
							<span
								class="block text-xs font-semibold {isActive ? 'text-gray-300' : 'text-gray-500'}"
							>
								{formatShortDate(entry.date)}, {getYear(entry.date)}
							</span>
							<span class="block truncate text-xs {isActive ? 'text-white' : 'text-gray-700'}">
								{entry.title}
							</span>
						</button>
					{/each}
				</nav>
			</aside>

			<!-- More entries below -->
			{#if railHasMore}
				<div class="pointer-events-none absolute right-0 -bottom-8 left-0 flex justify-center">
					<ChevronDown size={20} class="animate-bounce text-white/90 drop-shadow" />
				</div>
			{/if}
		</div>
	</div>
{/if}

<!-- Inline editor (lazy-loaded) -->
{#if composerOpen && Composer}
	<svelte:component this={Composer} kind="diary" docId={editingId} onClose={handleEditorClose} />
{/if}

<style>
	/* Scroll without visible scrollbars inside the popup */
	.no-scrollbar {
		scrollbar-width: none;
	}

	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}

	/* Prime-style popup: pure CSS entry animations */
	.overlay-backdrop {
		background: rgba(0, 0, 0, 0.6);
		animation: overlay-fade 0.2s ease-out;
	}

	@media (min-width: 768px) {
		.overlay-backdrop {
			backdrop-filter: blur(4px);
		}
	}

	.overlay-panel {
		animation: panel-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes overlay-fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes panel-pop {
		from {
			opacity: 0;
			transform: scale(0.92);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.overlay-backdrop,
		.overlay-panel {
			animation: none;
		}
	}

	.rail-label,
	.text-shadow {
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
	}

	/* Rail pills settle in one after another, with a playful sticky-note tilt */
	.rail-item {
		animation: rail-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) backwards;
		transition:
			transform 0.2s ease,
			opacity 0.2s ease,
			box-shadow 0.2s ease;
	}

	.diary-pill {
		transform: rotate(-0.8deg);
	}

	.diary-pill:nth-child(even) {
		transform: rotate(0.8deg);
	}

	.diary-pill:hover {
		transform: rotate(0deg) translateX(-4px) scale(1.03);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
	}

	@keyframes rail-in {
		from {
			opacity: 0;
			transform: translateX(24px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.rail-item {
			animation: none;
			transition: none;
		}
	}

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
