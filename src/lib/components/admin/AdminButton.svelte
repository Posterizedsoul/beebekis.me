<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variant = 'primary',
		type = 'button',
		disabled = false,
		href,
		target,
		onclick,
		class: extraClass = '',
		children
	}: {
		variant?: 'primary' | 'secondary' | 'danger';
		type?: 'button' | 'submit';
		disabled?: boolean;
		href?: string;
		target?: string;
		onclick?: (e: MouseEvent) => void;
		class?: string;
		children?: Snippet;
	} = $props();

	const variantClass: Record<string, string> = {
		primary: 'bg-black text-white border-black hover:bg-gray-800',
		secondary: 'bg-white text-black border-black hover:bg-gray-50',
		danger: 'bg-white text-red-600 border-red-600 hover:bg-red-50'
	};
</script>

{#if href}
	<a {href} {target} class="admin-btn {variantClass[variant]} {extraClass}">
		{@render children?.()}
	</a>
{:else}
	<button {type} {disabled} {onclick} class="admin-btn {variantClass[variant]} {extraClass}">
		{@render children?.()}
	</button>
{/if}

<style>
	.admin-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		border-radius: 0.125rem;
		border-width: 1px;
		padding: 0.625rem 1.25rem;
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		text-decoration: none;
		cursor: pointer;
		transition:
			background-color 0.2s,
			opacity 0.2s;
	}
	.admin-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
