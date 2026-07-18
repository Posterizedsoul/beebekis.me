<script lang="ts">
	import EntryComposer from '$lib/components/EntryComposer.svelte';
	import { goto } from '$app/navigation';
</script>

<EntryComposer kind="project" onClose={() => goto('/admin/projects')} />
