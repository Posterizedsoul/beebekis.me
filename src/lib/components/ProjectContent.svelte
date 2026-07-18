<script lang="ts">
	let { html }: { html: string } = $props();
</script>

<div class="prose-content">
	{@html html}
</div>

<style>
	.prose-content {
		max-width: 56rem;
		margin: 0 auto;
		font-size: 1.0625rem;
		line-height: 1.8;
		color: #374151;
	}

	:global(.prose-content p) {
		margin-bottom: 1.5rem;
	}

	:global(.prose-content h2) {
		font-size: 1.875rem;
		font-weight: 700;
		color: #111827;
		margin-top: 3rem;
		margin-bottom: 1rem;
	}

	:global(.prose-content h3) {
		font-size: 1.5rem;
		font-weight: 600;
		color: #1f2937;
		margin-top: 2.5rem;
		margin-bottom: 0.75rem;
	}

	:global(.prose-content img) {
		display: block;
		width: 100%;
		max-width: 100%;
		height: auto;
		border-radius: 12px;
		margin: 2rem auto;
		cursor: pointer;
		transition:
			transform 0.2s,
			box-shadow 0.2s;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
	}

	:global(.prose-content img:hover) {
		transform: scale(1.01);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
	}

	:global(.prose-content a) {
		color: #4f46e5;
		text-decoration: underline;
		text-underline-offset: 3px;
		transition: color 0.2s;
	}

	:global(.prose-content a:hover) {
		color: #4338ca;
	}

	:global(.prose-content ul),
	:global(.prose-content ol) {
		margin: 1.5rem 0;
		padding-left: 1.5rem;
	}

	:global(.prose-content li) {
		margin-bottom: 0.5rem;
	}

	:global(.prose-content pre) {
		background: #1e293b;
		color: #e2e8f0;
		padding: 1.5rem;
		border-radius: 12px;
		overflow-x: auto;
		margin: 2rem 0;
	}

	:global(.prose-content code) {
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		font-size: 0.9em;
	}

	/* Masonry layout for grouped images from editor */
	:global(.prose-content .image-gallery) {
		column-count: 2;
		column-gap: 1rem;
		margin: 2rem 0;
		width: 100%;
	}

	@media (max-width: 640px) {
		:global(.prose-content .image-gallery) {
			column-count: 1;
		}
	}

	:global(.prose-content .image-gallery img) {
		width: 100%;
		height: auto;
		margin: 0 0 1rem 0;
		break-inside: avoid;
		border-radius: 12px;
		cursor: pointer;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
		transition:
			transform 0.2s,
			box-shadow 0.2s;
	}

	:global(.prose-content .image-gallery img:hover) {
		transform: scale(1.02);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
	}

	/* Image group: a bordered "collection" card — gallery + caption shown together */
	:global(.prose-content .image-group) {
		margin: 2.75rem 0;
		padding: 1rem;
		border: 1px solid #e5e7eb;
		border-radius: 16px;
		background: #ffffff;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
		transition: box-shadow 0.2s;
	}

	:global(.prose-content .image-group:hover) {
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.07);
	}

	:global(.prose-content .image-group .image-gallery) {
		margin: 0;
	}

	:global(.prose-content .image-group .image-gallery img) {
		margin: 0 0 1rem;
		border-radius: 10px;
		box-shadow: none;
	}

	:global(.prose-content .image-group-caption) {
		margin-top: 0.25rem;
		padding-top: 0.875rem;
		border-top: 1px solid #f3f4f6;
		text-align: center;
		font-size: 0.9375rem;
		line-height: 1.6;
		color: #6b7280;
	}

	:global(.prose-content .image-group-caption p) {
		margin-bottom: 0.375rem;
	}

	:global(.prose-content .image-group-caption p:last-child) {
		margin-bottom: 0;
	}

	/* Hide the caption area (and its divider) when no caption was written */
	:global(.prose-content .image-group-caption:not(:has(p:not(:empty)))) {
		display: none;
	}

	:global(.prose-content blockquote) {
		border-left: 4px solid #e2e8f0;
		padding-left: 1.5rem;
		margin: 2rem 0;
		font-style: italic;
		color: #64748b;
	}
</style>
