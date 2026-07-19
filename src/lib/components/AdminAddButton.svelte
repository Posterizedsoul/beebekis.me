<script lang="ts">
	import { onMount } from 'svelte';
	import { isAdminHinted } from '$lib/adminHint';

	let { kind, label = 'Add' }: { kind: 'diary' | 'blog' | 'project' | 'memory'; label?: string } =
		$props();

	const collections: Record<string, string> = {
		diary: 'diary_entries',
		blog: 'blog_posts',
		project: 'projects',
		memory: 'memories'
	};

	let isLoggedIn = $state(false);
	let composerOpen = $state(false);
	let editingId = $state('');
	let drafts: { id: string; title: string; updatedAt: number }[] = $state([]);
	// Composer (tiptap + firebase editor) is lazy-loaded so it never ships to visitors
	let Composer = $state<typeof import('$lib/components/EntryComposer.svelte').default | null>(null);

	onMount(() => {
		// Skip Firebase entirely for anonymous visitors — the SDK never loads on
		// public pages unless this browser has logged in as the owner.
		if (!isAdminHinted()) return;
		let unsub: (() => void) | undefined;
		import('$lib/firebase').then(({ auth }) => {
			unsub = auth.onAuthStateChanged((user: unknown) => {
				isLoggedIn = !!user;
				if (user) loadDrafts();
			});
		});
		return () => unsub?.();
	});

	async function loadDrafts() {
		try {
			const [{ db }, { collection, query, where, getDocs }] = await Promise.all([
				import('$lib/firebase'),
				import('firebase/firestore')
			]);
			const snap = await getDocs(
				query(collection(db, collections[kind]), where('isPublished', '==', false))
			);
			type Draft = { id: string; title: string; updatedAt: number };
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			drafts = snap.docs
				.map((d: any): Draft => {
					const data = d.data();
					return {
						id: d.id,
						title: data.title || 'Untitled',
						updatedAt: data.updatedAt?.toMillis?.() ?? 0
					};
				})
				.sort((a: Draft, b: Draft) => b.updatedAt - a.updatedAt)
				.slice(0, 8);
		} catch (err) {
			console.error('Failed to load drafts:', err);
		}
	}

	async function openComposer(docId = '') {
		if (!Composer) {
			Composer = (await import('$lib/components/EntryComposer.svelte')).default;
		}
		editingId = docId;
		composerOpen = true;
	}

	function handleClose() {
		composerOpen = false;
		loadDrafts();
	}
</script>

{#if isLoggedIn}
	<div class="flex flex-col items-end gap-2">
		<button type="button" onclick={() => openComposer()} class="admin-add-link" title={label}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<circle cx="12" cy="12" r="10" />
				<line x1="12" y1="8" x2="12" y2="16" />
				<line x1="8" y1="12" x2="16" y2="12" />
			</svg>
			<span>{label}</span>
		</button>

		{#if drafts.length > 0}
			<div class="flex max-w-md flex-wrap items-center justify-end gap-1.5">
				<span class="py-1 text-xs tracking-wider text-gray-400 uppercase">Drafts</span>
				{#each drafts as draft (draft.id)}
					<button
						type="button"
						onclick={() => openComposer(draft.id)}
						class="max-w-40 truncate rounded-full border border-dashed border-gray-400 bg-white/80 px-3 py-1 text-xs text-gray-600 transition-colors hover:border-black hover:text-black"
						title="Resume draft: {draft.title}"
					>
						{draft.title}
					</button>
				{/each}
			</div>
		{/if}
	</div>
{/if}

{#if composerOpen && Composer}
	<Composer {kind} docId={editingId} onClose={handleClose} />
{/if}

<style>
	.admin-add-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1.25rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: #ffffff;
		text-decoration: none;
		cursor: pointer;
		background: rgba(17, 24, 39, 0.9);
		backdrop-filter: blur(4px);
		border-radius: 9999px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		transition: all 0.2s ease;
	}
	.admin-add-link:hover {
		background: rgba(55, 65, 81, 0.95);
		transform: scale(1.05);
	}
</style>
