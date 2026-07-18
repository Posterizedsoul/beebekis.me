<script lang="ts">
	import EntryComposer from '$lib/components/EntryComposer.svelte';
	import { goto } from '$app/navigation';
</script>

<EntryComposer kind="memory" onClose={() => goto('/admin/memories')} />
