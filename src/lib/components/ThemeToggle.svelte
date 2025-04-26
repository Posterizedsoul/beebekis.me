<script lang="ts">
	import { theme, setTheme } from '$lib/stores/theme';
	import { Sun, Moon, Monitor } from 'lucide-svelte'; // Icons

	// No longer need $state or $effect here
	// We will use $theme directly in the template and cycleTheme

	function cycleTheme() {
		let nextTheme: 'light' | 'dark' | 'system';
		// Use the reactive $theme value directly
		if ($theme === 'light') {
			nextTheme = 'dark';
		} else if ($theme === 'dark') {
			nextTheme = 'system';
		} else { // theme is 'system'
			nextTheme = 'light';
		}
		setTheme(nextTheme);
	}
</script>

<button
	onclick={cycleTheme}
	class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
	aria-label="Toggle theme"
	title="Toggle theme ({$theme})" 
>
	{#if $theme === 'light'} 
		<Sun size={18} />
	{:else if $theme === 'dark'} 
		<Moon size={18} />
	{:else} 
		<Monitor size={18} />
	{/if}
</button>
