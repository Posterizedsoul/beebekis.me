<script lang="ts">
	import EntryComposer from '$lib/components/EntryComposer.svelte';
	import { goto } from '$app/navigation';
</script>

<EntryComposer kind="diary" onClose={() => goto('/admin/diary')} />
