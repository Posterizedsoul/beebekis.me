<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { fade } from 'svelte/transition'; // Re-import fade
	import { ArrowUp } from 'lucide-svelte';

	export let showOnPx = 200;

	let hidden = true;

	function goTop() {
		if (!browser) return;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function handleOnScroll() {
		if (!browser) return;
		const scrollY = window.scrollY;
		const shouldBeHidden = scrollY < showOnPx;
		if (hidden !== shouldBeHidden) {
			console.log(`BackToTop State Change: hidden = ${shouldBeHidden} (scrollY: ${scrollY})`);
			hidden = shouldBeHidden;
		}
	}

	onMount(() => {
		console.log('BackToTop Component Mounted'); // Log mount
		if (browser) {
			window.addEventListener('scroll', handleOnScroll);
			handleOnScroll(); // Initial check
		}
	});

	onDestroy(() => {
		console.log('BackToTop Component Destroyed'); // Log destroy
		if (browser) {
			window.removeEventListener('scroll', handleOnScroll);
		}
	});
</script>

{#if !hidden}
	{@const _ = console.log('BackToTop: Rendering button (hidden=false)')}
	<button
		class="back-to-top"
		on:click={goTop}
		aria-label="Scroll to top"
		title="Scroll to top"
		transition:fade={{ duration: 300 }} 
	>
		<ArrowUp size={24} />
	</button>
{/if}

<style>
	.back-to-top {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		background-color: rgba(0, 0, 0, 0.6);
		color: white;
		border: none;
		border-radius: 50%;
		width: 3rem;
		height: 3rem;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		z-index: 1000;
		 /* Add back opacity/visibility transition for fade */
		transition: background-color 0.2s ease, transform 0.2s ease, opacity 0.3s ease, visibility 0.3s ease;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
	}

	.back-to-top:hover {
		background-color: rgba(0, 0, 0, 0.8);
		transform: scale(1.05);
	}

	.back-to-top:active {
		transform: scale(0.95);
	}
</style>
