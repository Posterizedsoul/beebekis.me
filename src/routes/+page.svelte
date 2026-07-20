<script lang="ts">
	import { onMount } from 'svelte';
	import backgroundImg from '$lib/assets/background.png?enhanced';

	// Tells Google this site *is* the entity "Bibek Bhatta"
	const siteSchema = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'Bibek Bhatta',
		alternateName: ['Bibek Bhatta Portfolio', 'Beebek Bhatta'],
		url: 'https://bibekbhatta.com'
	};

	// Person structured data so a name search surfaces the site with rich info
	const personSchema = {
		'@context': 'https://schema.org',
		'@type': 'Person',
		mainEntityOfPage: 'https://bibekbhatta.com',
		name: 'Bibek Bhatta',
		alternateName: 'Beebek Bhatta',
		url: 'https://bibekbhatta.com',
		image: 'https://bibekbhatta.com/b.png',
		jobTitle: 'Mechanical Engineer',
		description:
			'Mechanical Engineering undergraduate focused on aerospace autonomy and robotics — CAD, embedded computer vision, and autonomous control.',
		affiliation: {
			'@type': 'CollegeOrUniversity',
			name: 'Mississippi State University'
		},
		knowsAbout: [
			'Mechanical Engineering',
			'Robotics',
			'UAV Systems',
			'Computer Vision',
			'CAD',
			'Autonomous Control',
			'3D Printing'
		],
		sameAs: [
			'https://github.com/beebekisme',
			'https://github.com/Posterizedsoul',
			'https://www.linkedin.com/in/beebekisme/',
			'https://www.instagram.com/beebekisme/',
			'https://www.facebook.com/BeebekBhatt/'
		]
	};

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

<svelte:head>
	<title>Bibek Bhatta — Mechanical Engineer</title>
	<meta
		name="description"
		content="Bibek Bhatta — Mechanical Engineering undergraduate focused on aerospace autonomy and robotics. Projects in UAV systems, CAD, computer vision, and autonomous control."
	/>
	<link rel="canonical" href="https://bibekbhatta.com/" />
	{@html `<script type="application/ld+json">${JSON.stringify(personSchema)}<\/script>`}
	{@html `<script type="application/ld+json">${JSON.stringify(siteSchema)}<\/script>`}
</svelte:head>

<div class="hero" onmousemove={handleMouseMove} role="banner">
	<!-- Blurred background layer -->
	<div class="bg-blurred">
		<enhanced:img src={backgroundImg} alt="" aria-hidden="true" sizes="100vw" />
	</div>

	<!-- Clear background with mask following cursor -->
	<div class="bg-clear" style="--mouse-x: {mouseX}px; --mouse-y: {mouseY}px;">
		<enhanced:img src={backgroundImg} alt="" aria-hidden="true" sizes="100vw" />
	</div>

	<!-- Name -->
	<div class="content">
		<h1 class="name">
			<span class="name-top">Bibek</span>
			<span class="middle-line"></span>
			<span class="name-bottom">Bhatta</span>
		</h1>
	</div>

	<a class="scroll-cue" href="#intro" aria-label="Scroll to introduction">
		<span></span>
	</a>
</div>

<!-- Real, crawlable content: without this the homepage gave search engines
     ~15 words, which is why it had nothing to rank on. -->
<section id="intro" class="intro">
	<div class="intro-inner">
		<h2 class="intro-heading">Mechanical Engineer</h2>
		<p class="intro-lead">
			I'm <strong>Bibek Bhatta</strong>, a Mechanical Engineering undergraduate at
			<strong>Mississippi State University</strong> working at the intersection of aerospace autonomy
			and robotics. I design complete mechatronic systems — from CAD and 3D-printed hardware to embedded
			computer vision and autonomous flight control.
		</p>
		<p class="intro-body">
			My current work includes an autonomous <strong>VTOL medical-delivery UAV</strong> (a tri-EDF
			tiltrotor running PX4 with GPS waypoint navigation and A* path planning), a
			<strong>multi-illumination imaging rig</strong> grading guitar tonewood for a CNN quality-control
			model, and a standardized library of 3D-printable mechatronic subsystems — cycloidal and planetary
			gearboxes, lead-screw stages, and custom motor controllers — built as Design Lead for the MSU Robotics
			Club's NASA ISAM entry.
		</p>

		<ul class="focus-list">
			<li>CAD &amp; CAE — SolidWorks, Onshape, CFD, FEA, GD&amp;T</li>
			<li>Robotics &amp; UAV systems — PX4, Pixhawk, autonomous control</li>
			<li>Computer vision &amp; ML — Python, PyTorch, OpenCV, NVIDIA Jetson</li>
			<li>Design for manufacturing — FDM 3D printing, drivetrain design</li>
		</ul>

		<nav class="intro-links" aria-label="Explore this site">
			<a href="/projects">View my projects →</a>
			<a href="/blog">Read the blog →</a>
			<a href="/about">About &amp; résumé →</a>
		</nav>
	</div>
</section>

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

	.bg-blurred :global(picture) {
		display: block;
		width: 100%;
		height: 100%;
	}

	.bg-blurred :global(img) {
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

	.bg-clear :global(picture) {
		display: block;
		width: 100%;
		height: 100%;
	}

	.bg-clear :global(img) {
		width: 100%;
		height: 100%;
		object-fit: contain;
		opacity: 0.8;
		transform: scale(0.9);
		transform-origin: center;
	}

	/* Name content - centered within the hero */
	.content {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 2;
	}

	/* Subtle cue that there is more below */
	.scroll-cue {
		position: absolute;
		bottom: 2rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 3;
		display: block;
		width: 1.5rem;
		height: 2.4rem;
		border: 2px solid rgba(31, 41, 55, 0.35);
		border-radius: 1rem;
	}

	.scroll-cue span {
		display: block;
		width: 3px;
		height: 7px;
		margin: 0.45rem auto 0;
		border-radius: 2px;
		background: rgba(31, 41, 55, 0.55);
		animation: cue 1.8s ease-in-out infinite;
	}

	@keyframes cue {
		0%,
		100% {
			transform: translateY(0);
			opacity: 0.8;
		}
		50% {
			transform: translateY(0.7rem);
			opacity: 0.2;
		}
	}

	/* ===== Intro / SEO content ===== */
	.intro {
		background: #fff;
		padding: 6rem 1.5rem 7rem;
		border-top: 1px solid #f1f1f1;
	}

	.intro-inner {
		max-width: 46rem;
		margin: 0 auto;
	}

	.intro-heading {
		font-family: 'Noto Serif', serif;
		font-size: clamp(1.75rem, 4vw, 2.75rem);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: #111;
		margin: 0 0 2rem;
	}

	.intro-lead {
		font-size: 1.25rem;
		line-height: 1.7;
		color: #374151;
		margin: 0 0 1.5rem;
	}

	.intro-body {
		font-size: 1.0625rem;
		line-height: 1.8;
		color: #4b5563;
		margin: 0 0 2.5rem;
	}

	.intro-lead strong,
	.intro-body strong {
		color: #111;
		font-weight: 600;
	}

	.focus-list {
		list-style: none;
		padding: 0;
		margin: 0 0 3rem;
		display: grid;
		gap: 0.75rem;
	}

	.focus-list li {
		font-size: 0.9375rem;
		color: #4b5563;
		padding-left: 1.25rem;
		position: relative;
	}

	.focus-list li::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0.6em;
		width: 6px;
		height: 6px;
		background: #111;
		border-radius: 50%;
	}

	.intro-links {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		padding-top: 2rem;
		border-top: 1px solid #f1f1f1;
	}

	.intro-links a {
		font-family: 'Noto Serif', serif;
		font-size: 0.9375rem;
		font-weight: 600;
		letter-spacing: 0.03em;
		text-transform: uppercase;
		color: #6b7280;
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.intro-links a:hover {
		color: #000;
	}

	@media (prefers-reduced-motion: reduce) {
		.scroll-cue span {
			animation: none;
		}
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
		align-items: center;
	}

	.name-top {
		display: block;
		transform: translateY(-0.05em);
	}

	.middle-line {
		display: block;
		width: 100%;
		height: 2px;
		background: transparent;
		margin: 0.05em 0;
	}

	.name-bottom {
		display: block;
		transform: translateY(0.05em);
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
