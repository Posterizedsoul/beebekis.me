<script lang="ts">
	import { onMount } from 'svelte';
	import { isAdminHinted } from '$lib/adminHint';
	import { QrCode, X } from 'lucide-svelte';

	let isLoggedIn = $state(false);
	let open = $state(false);
	// Both Firebase and the QR library are lazy — neither reaches public visitors
	let Generator = $state<typeof import('$lib/components/QrGenerator.svelte').default | null>(null);

	onMount(() => {
		if (!isAdminHinted()) return;
		let unsub: (() => void) | undefined;
		import('$lib/firebase').then(({ auth }) => {
			unsub = auth.onAuthStateChanged((user: unknown) => {
				isLoggedIn = !!user;
			});
		});
		return () => unsub?.();
	});

	async function openPanel() {
		if (!Generator) {
			Generator = (await import('$lib/components/QrGenerator.svelte')).default;
		}
		open = true;
	}

	function close() {
		open = false;
	}

	// Lock page scroll while the panel is open
	$effect(() => {
		if (!open) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prev;
		};
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) close();
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isLoggedIn}
	<button
		type="button"
		onclick={openPanel}
		class="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-full bg-gray-900/90 px-4 py-2.5 text-sm font-medium text-white shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:bg-gray-700"
		title="QR generator"
		aria-label="Open QR generator"
	>
		<QrCode size={16} />
		<span class="hidden sm:inline">QR</span>
	</button>
{/if}

{#if open && Generator}
	<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
	<div class="qr-backdrop fixed inset-0 z-[90]" onclick={close}></div>

	<div class="pointer-events-none fixed inset-0 z-[95] flex items-center justify-center p-3 md:p-8">
		<div
			class="qr-panel pointer-events-auto relative flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
		>
			<header
				class="flex flex-shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4"
			>
				<h2 class="font-serif text-sm font-semibold tracking-widest text-gray-900 uppercase">
					QR Generator
				</h2>
				<button
					type="button"
					onclick={close}
					class="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-black"
					aria-label="Close"
				>
					<X size={18} />
				</button>
			</header>

			<div class="flex-1 overflow-y-auto px-6 py-6 md:px-8">
				<Generator showHeading={false} />
			</div>
		</div>
	</div>
{/if}

<style>
	/* CSS animations rather than svelte transitions: outros on fixed overlays
	   can hang teardown and leave the panel stuck on screen. */
	.qr-backdrop {
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		animation: qr-fade 0.2s ease-out;
	}

	.qr-panel {
		animation: qr-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes qr-fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes qr-pop {
		from {
			opacity: 0;
			transform: scale(0.94);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.qr-backdrop,
		.qr-panel {
			animation: none;
		}
	}
</style>
