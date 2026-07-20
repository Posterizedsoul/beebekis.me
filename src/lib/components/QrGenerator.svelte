<script lang="ts">
	import QRCode from 'qrcode';
	import { PUBLIC_BASE_URL } from '$env/static/public';

	type Level = 'L' | 'M' | 'Q' | 'H';

	let { showHeading = true }: { showHeading?: boolean } = $props();

	const DEFAULT_BASE = (PUBLIC_BASE_URL || 'https://www.bibekbhatta.com').replace(/\/$/, '');

	// Destination
	let baseUrl = $state(DEFAULT_BASE);
	let path = $state('/');

	// UTM campaign tagging (what Vercel Analytics filters on)
	let utmSource = $state('resume');
	let utmMedium = $state('qr');
	let utmCampaign = $state('print');
	let useUtm = $state(true);

	// Appearance
	let size = $state(1000);
	let margin = $state(2);
	let level: Level = $state('H');
	let dark = $state('#000000');
	let light = $state('#ffffff');

	let pngDataUrl = $state('');
	let error = $state('');

	const presets = [
		{ label: 'Résumé / CV', path: '/', source: 'resume' },
		{ label: 'Business card', path: '/', source: 'business_card' },
		{ label: 'Poster / project', path: '/projects', source: 'poster' }
	];

	function applyPreset(p: (typeof presets)[number]) {
		path = p.path;
		utmSource = p.source;
		utmMedium = 'qr';
		utmCampaign = 'print';
		useUtm = true;
	}

	// The exact string encoded into the QR
	const finalUrl = $derived.by(() => {
		const cleanBase = baseUrl.replace(/\/$/, '');
		const cleanPath = path.startsWith('/') ? path : `/${path}`;
		let url = `${cleanBase}${cleanPath}`;
		if (useUtm) {
			const params = new URLSearchParams();
			if (utmSource.trim()) params.set('utm_source', utmSource.trim());
			if (utmMedium.trim()) params.set('utm_medium', utmMedium.trim());
			if (utmCampaign.trim()) params.set('utm_campaign', utmCampaign.trim());
			const qs = params.toString();
			if (qs) url += `?${qs}`;
		}
		return url;
	});

	const fileName = $derived(
		(useUtm && utmSource.trim() ? utmSource.trim() : 'qr').replace(/[^a-z0-9_-]/gi, '-')
	);

	const qrOptions = $derived({
		errorCorrectionLevel: level,
		margin,
		color: { dark, light }
	});

	// Live preview
	$effect(() => {
		const url = finalUrl;
		const opts = qrOptions;
		const px = size;
		error = '';
		QRCode.toDataURL(url, { ...opts, width: Math.min(px, 1200) })
			.then((d) => (pngDataUrl = d))
			.catch((e) => {
				error = e instanceof Error ? e.message : String(e);
				pngDataUrl = '';
			});
	});

	function triggerDownload(href: string, name: string) {
		const a = document.createElement('a');
		a.href = href;
		a.download = name;
		document.body.appendChild(a);
		a.click();
		a.remove();
	}

	async function downloadPng() {
		try {
			// Render at the requested size rather than the capped preview size
			const full = await QRCode.toDataURL(finalUrl, { ...qrOptions, width: size });
			triggerDownload(full, `${fileName}-qr.png`);
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		}
	}

	async function downloadSvg() {
		try {
			const svg = await QRCode.toString(finalUrl, { ...qrOptions, type: 'svg' });
			const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
			triggerDownload(url, `${fileName}-qr.svg`);
			URL.revokeObjectURL(url);
		} catch (e) {
			error = e instanceof Error ? e.message : String(e);
		}
	}

	let copied = $state(false);
	async function copyUrl() {
		await navigator.clipboard.writeText(finalUrl);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<div class="space-y-8">
	{#if showHeading}
		<div>
			<h1 class="font-serif text-3xl font-bold tracking-wide text-black uppercase">QR Generator</h1>
			<p class="mt-2 text-sm text-gray-500">
				Build a UTM-tagged link and export a print-ready QR code. Scans show up in Vercel Analytics
				filtered by <code class="rounded-sm bg-gray-100 px-1">utm_source</code>.
			</p>
		</div>
	{/if}

	<div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
		<!-- Controls -->
		<div class="space-y-6">
			<!-- Presets -->
			<div>
				<span class="mb-2 block text-xs font-medium tracking-wide text-gray-500 uppercase"
					>Presets</span
				>
				<div class="flex flex-wrap gap-2">
					{#each presets as p (p.label)}
						<button
							type="button"
							onclick={() => applyPreset(p)}
							class="rounded-sm border px-3 py-1.5 text-sm transition-colors {utmSource === p.source
								? 'border-black bg-black text-white'
								: 'border-gray-300 text-gray-700 hover:border-black hover:text-black'}"
						>
							{p.label}
						</button>
					{/each}
				</div>
			</div>

			<!-- Destination -->
			<fieldset class="space-y-4 rounded-sm border border-gray-200 p-4">
				<legend class="px-1 text-xs font-medium tracking-wide text-gray-500 uppercase"
					>Destination</legend
				>
				<div class="grid gap-4 sm:grid-cols-2">
					<div>
						<label for="baseUrl" class="block text-xs font-medium text-gray-500">Base URL</label>
						<input
							id="baseUrl"
							type="text"
							bind:value={baseUrl}
							class="mt-1 block w-full rounded-sm border-gray-300 py-2 text-sm focus:border-black focus:ring-black"
						/>
					</div>
					<div>
						<label for="path" class="block text-xs font-medium text-gray-500">Path</label>
						<input
							id="path"
							type="text"
							bind:value={path}
							placeholder="/projects"
							class="mt-1 block w-full rounded-sm border-gray-300 py-2 text-sm focus:border-black focus:ring-black"
						/>
					</div>
				</div>
			</fieldset>

			<!-- UTM -->
			<fieldset class="space-y-4 rounded-sm border border-gray-200 p-4">
				<legend class="px-1 text-xs font-medium tracking-wide text-gray-500 uppercase"
					>Campaign tracking</legend
				>
				<label class="flex items-center gap-2 text-sm text-gray-700">
					<input
						type="checkbox"
						bind:checked={useUtm}
						class="h-4 w-4 rounded-sm border-gray-300 text-black focus:ring-black"
					/>
					Add UTM parameters (needed to tell sources apart in Analytics)
				</label>

				{#if useUtm}
					<div class="grid gap-4 sm:grid-cols-3">
						<div>
							<label for="utmSource" class="block text-xs font-medium text-gray-500">Source</label>
							<input
								id="utmSource"
								type="text"
								bind:value={utmSource}
								class="mt-1 block w-full rounded-sm border-gray-300 py-2 text-sm focus:border-black focus:ring-black"
							/>
						</div>
						<div>
							<label for="utmMedium" class="block text-xs font-medium text-gray-500">Medium</label>
							<input
								id="utmMedium"
								type="text"
								bind:value={utmMedium}
								class="mt-1 block w-full rounded-sm border-gray-300 py-2 text-sm focus:border-black focus:ring-black"
							/>
						</div>
						<div>
							<label for="utmCampaign" class="block text-xs font-medium text-gray-500"
								>Campaign</label
							>
							<input
								id="utmCampaign"
								type="text"
								bind:value={utmCampaign}
								class="mt-1 block w-full rounded-sm border-gray-300 py-2 text-sm focus:border-black focus:ring-black"
							/>
						</div>
					</div>
				{/if}
			</fieldset>

			<!-- Appearance -->
			<fieldset class="space-y-4 rounded-sm border border-gray-200 p-4">
				<legend class="px-1 text-xs font-medium tracking-wide text-gray-500 uppercase"
					>Appearance</legend
				>
				<div class="grid gap-4 sm:grid-cols-2">
					<div>
						<label for="size" class="block text-xs font-medium text-gray-500">
							PNG size — {size}px
						</label>
						<input
							id="size"
							type="range"
							min="200"
							max="2000"
							step="100"
							bind:value={size}
							class="mt-2 block w-full accent-black"
						/>
					</div>
					<div>
						<label for="margin" class="block text-xs font-medium text-gray-500">
							Quiet zone — {margin}
						</label>
						<input
							id="margin"
							type="range"
							min="0"
							max="8"
							step="1"
							bind:value={margin}
							class="mt-2 block w-full accent-black"
						/>
					</div>
					<div>
						<label for="level" class="block text-xs font-medium text-gray-500"
							>Error correction</label
						>
						<select
							id="level"
							bind:value={level}
							class="mt-1 block w-full rounded-sm border-gray-300 py-2 text-sm focus:border-black focus:ring-black"
						>
							<option value="L">L — 7% (smallest code)</option>
							<option value="M">M — 15%</option>
							<option value="Q">Q — 25%</option>
							<option value="H">H — 30% (best for print/logo)</option>
						</select>
					</div>
					<div class="flex gap-4">
						<div>
							<label for="dark" class="block text-xs font-medium text-gray-500">Foreground</label>
							<input
								id="dark"
								type="color"
								bind:value={dark}
								class="mt-1 h-9 w-16 cursor-pointer rounded-sm border border-gray-300"
							/>
						</div>
						<div>
							<label for="light" class="block text-xs font-medium text-gray-500">Background</label>
							<input
								id="light"
								type="color"
								bind:value={light}
								class="mt-1 h-9 w-16 cursor-pointer rounded-sm border border-gray-300"
							/>
						</div>
					</div>
				</div>
				<p class="text-xs text-gray-400">
					Keep strong contrast (dark on light). Very light foregrounds or dark backgrounds often
					fail to scan.
				</p>
			</fieldset>
		</div>

		<!-- Preview -->
		<div class="lg:sticky lg:top-24 lg:self-start">
			<div class="rounded-sm border border-gray-200 p-4">
				<span class="mb-3 block text-xs font-medium tracking-wide text-gray-500 uppercase"
					>Preview</span
				>

				{#if error}
					<p class="rounded-sm bg-red-50 p-3 text-xs text-red-600">{error}</p>
				{:else if pngDataUrl}
					<img
						src={pngDataUrl}
						alt="QR code preview"
						class="mx-auto block w-full max-w-[240px] rounded-sm"
					/>
				{/if}

				<div class="mt-4 rounded-sm bg-gray-50 p-3">
					<span class="block text-xs font-medium text-gray-500">Encoded URL</span>
					<p class="mt-1 font-mono text-[11px] leading-relaxed break-all text-gray-700">
						{finalUrl}
					</p>
					<button
						type="button"
						onclick={copyUrl}
						class="mt-2 text-xs font-medium text-gray-500 transition-colors hover:text-black"
					>
						{copied ? 'Copied ✓' : 'Copy link'}
					</button>
				</div>

				<div class="mt-4 flex flex-col gap-2">
					<button
						type="button"
						onclick={downloadPng}
						class="rounded-sm border border-black bg-black px-4 py-2 font-serif text-sm font-medium tracking-wider text-white uppercase transition-colors hover:bg-gray-800"
					>
						Download PNG
					</button>
					<button
						type="button"
						onclick={downloadSvg}
						class="rounded-sm border border-black bg-white px-4 py-2 font-serif text-sm font-medium tracking-wider text-black uppercase transition-colors hover:bg-gray-100"
					>
						Download SVG (print)
					</button>
				</div>

				<p class="mt-3 text-xs text-gray-400">
					Use SVG for résumés and print — it stays sharp at any size. Test the printed code on a
					couple of phones before ordering a batch.
				</p>
			</div>
		</div>
	</div>
</div>
