<script lang="ts">
	import { onMount } from 'svelte';

	let mouseX = $state(0);
	let mouseY = $state(0);
	let targetX = $state(0);
	let targetY = $state(0);

	function handleMouseMove(e: MouseEvent) {
		targetX = e.clientX;
		targetY = e.clientY;
	}

	onMount(() => {
		// Smooth liquid-like following with lerp
		let animationId: number;

		function animate() {
			// Lerp factor - lower = more fluid/laggy
			const lerp = 0.08;
			mouseX += (targetX - mouseX) * lerp;
			mouseY += (targetY - mouseY) * lerp;
			animationId = requestAnimationFrame(animate);
		}

		animate();

		return () => {
			cancelAnimationFrame(animationId);
		};
	});
</script>

<div class="hero" onmousemove={handleMouseMove} role="banner">
	<!-- Blurred background layer -->
	<div class="bg-blurred">
		<img src="/background.png" alt="" aria-hidden="true" />
	</div>

	<!-- Clear background with mask following cursor -->
	<div class="bg-clear" style="--mouse-x: {mouseX}px; --mouse-y: {mouseY}px;">
		<img src="/background.png" alt="" aria-hidden="true" />
	</div>

	<!-- Name -->
	<div class="content">
		<h1 class="name">
			<span>Bibek</span>
			<span>Bhatta</span>
		</h1>
	</div>
</div>

<style>
	.hero {
		position: relative;
		width: 100%;
		height: 100vh;
		overflow: hidden;
		background: #fff;
		cursor: default;
	}

	/* Blurred background - always visible */
	.bg-blurred {
		position: absolute;
		inset: 0;
		z-index: 0;
	}

	.bg-blurred img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		filter: blur(2px);
		opacity: 0.5;
		transform: scale(0.9);
		transform-origin: center;
	}

	/* Clear background - masked by cursor halo */
	.bg-clear {
		position: absolute;
		inset: 0;
		z-index: 1;
		mask-image: radial-gradient(
			circle 200px at var(--mouse-x) var(--mouse-y),
			black 0%,
			transparent 100%
		);
		-webkit-mask-image: radial-gradient(
			circle 200px at var(--mouse-x) var(--mouse-y),
			black 0%,
			transparent 100%
		);
	}

	.bg-clear img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		opacity: 0.8;
		transform: scale(0.9);
		transform-origin: center;
	}

	/* Name content */
	.content {
		position: relative;
		z-index: 2;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
	}

	.name {
		font-size: clamp(5rem, 20vw, 20rem);
		font-weight: normal;
		line-height: 0.85;
		color: #1f2937;
		text-align: center;
		margin: 0;
		display: flex;
		flex-direction: column;
	}

	.name span {
		display: block;
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.bg-clear {
			mask-image: none;
			-webkit-mask-image: none;
			display: none;
		}
	}
</style>
