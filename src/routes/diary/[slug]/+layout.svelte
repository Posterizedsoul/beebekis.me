<script lang="ts">
	// This layout applies only to individual diary entries ([slug])
	let { children } = $props();
</script>

<div>
	{@render children()}
</div>
