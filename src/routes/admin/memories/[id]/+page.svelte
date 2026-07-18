<script lang="ts">
	import EntryComposer from '$lib/components/EntryComposer.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
</script>

<EntryComposer kind="memory" docId={page.params.id} onClose={() => goto('/admin/memories')} />
