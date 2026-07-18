<script lang="ts">
	import EntryComposer from '$lib/components/EntryComposer.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
</script>

<EntryComposer kind="project" docId={page.params.id} onClose={() => goto('/admin/projects')} />
