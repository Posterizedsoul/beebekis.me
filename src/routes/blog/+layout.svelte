<script lang="ts">
    // This layout applies to /blog and its children
    let { children } = $props();
</script>

<div>
    <!-- You can add specific layout elements for the blog section here if needed -->
    {@render children()}
</div>