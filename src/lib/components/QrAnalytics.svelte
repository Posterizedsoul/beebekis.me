<script lang="ts">
	import { onMount } from 'svelte';

	type EventRow = {
		path: string;
		utmSource: string;
		utmMedium: string;
		utmCampaign: string;
		referrerHost: string;
		device: string;
		browser: string;
		os: string;
		country: string;
		region: string;
		city: string;
		timezone: string;
		language: string;
		ts: Date;
	};

	// ISO country code -> flag emoji, so the location list reads at a glance
	function flag(code: string): string {
		if (!/^[A-Z]{2}$/.test(code)) return '';
		return String.fromCodePoint(...[...code].map((c) => 0x1f1a5 + c.charCodeAt(0)));
	}

	let loading = $state(true);
	let error = $state('');
	let events: EventRow[] = $state([]);
	let days = $state(30);

	async function load() {
		loading = true;
		error = '';
		try {
			const [{ db }, { collection, getDocs, query, where, orderBy, limit }] = await Promise.all([
				import('$lib/firebase'),
				import('firebase/firestore')
			]);

			const since = new Date();
			since.setDate(since.getDate() - days);

			const snap = await getDocs(
				query(
					collection(db, 'analytics_events'),
					where('ts', '>=', since),
					orderBy('ts', 'desc'),
					limit(2000)
				)
			);

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			events = snap.docs.map((d: any) => {
				const v = d.data();
				return {
					path: v.path ?? '',
					utmSource: v.utmSource ?? '',
					utmMedium: v.utmMedium ?? '',
					utmCampaign: v.utmCampaign ?? '',
					referrerHost: v.referrerHost ?? '',
					device: v.device ?? '',
					browser: v.browser ?? '',
					os: v.os ?? '',
					country: v.country ?? '',
					region: v.region ?? '',
					city: v.city ?? '',
					timezone: v.timezone ?? '',
					language: v.language ?? '',
					ts: v.ts?.toDate ? v.ts.toDate() : new Date(v.ts)
				};
			});
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			error = msg.includes('index')
				? 'Firestore needs a composite index for this query — open the link in the browser console to create it (one click).'
				: msg;
		} finally {
			loading = false;
		}
	}

	onMount(load);

	const total = $derived(events.length);
	const qrScans = $derived(events.filter((e) => e.utmMedium === 'qr').length);

	function tally(rows: EventRow[], key: (e: EventRow) => string) {
		const map = new Map<string, number>();
		for (const r of rows) {
			const k = key(r);
			if (!k) continue;
			map.set(k, (map.get(k) ?? 0) + 1);
		}
		return [...map.entries()].sort((a, b) => b[1] - a[1]);
	}

	const bySource = $derived(
		tally(
			events.filter((e) => e.utmMedium === 'qr'),
			(e) => e.utmSource
		)
	);
	const byPath = $derived(tally(events, (e) => e.path).slice(0, 8));
	const byReferrer = $derived(tally(events, (e) => e.referrerHost).slice(0, 6));
	const byDevice = $derived(tally(events, (e) => e.device));
	const byCountry = $derived(tally(events, (e) => e.country).slice(0, 8));
	const byCity = $derived(
		tally(events, (e) => (e.city ? `${e.city}${e.region ? ', ' + e.region : ''}` : '')).slice(0, 8)
	);
	const byBrowser = $derived(tally(events, (e) => e.browser).slice(0, 6));
	const byOs = $derived(tally(events, (e) => e.os).slice(0, 6));
	const byLanguage = $derived(tally(events, (e) => e.language).slice(0, 6));

	// Simple daily sparkline over the selected window
	const daily = $derived.by(() => {
		const buckets = new Map<string, number>();
		for (let i = days - 1; i >= 0; i--) {
			const d = new Date();
			d.setDate(d.getDate() - i);
			buckets.set(d.toISOString().slice(0, 10), 0);
		}
		for (const e of events) {
			const k = e.ts.toISOString().slice(0, 10);
			if (buckets.has(k)) buckets.set(k, (buckets.get(k) ?? 0) + 1);
		}
		return [...buckets.entries()];
	});

	const peak = $derived(Math.max(1, ...daily.map(([, n]) => n)));
</script>

<div class="space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div class="flex gap-2">
			{#each [7, 30, 90] as d (d)}
				<button
					type="button"
					onclick={() => {
						days = d;
						load();
					}}
					class="rounded-sm border px-3 py-1.5 text-sm transition-colors {days === d
						? 'border-black bg-black text-white'
						: 'border-gray-300 text-gray-600 hover:border-black hover:text-black'}"
				>
					{d}d
				</button>
			{/each}
		</div>
		<button
			type="button"
			onclick={load}
			class="text-sm font-medium text-gray-500 transition-colors hover:text-black"
		>
			Refresh
		</button>
	</div>

	{#if loading}
		<p class="py-10 text-center text-sm text-gray-500">Loading analytics…</p>
	{:else if error}
		<div class="rounded-sm bg-red-50 p-4 text-sm text-red-700">{error}</div>
	{:else if total === 0}
		<div class="rounded-sm border border-gray-200 bg-gray-50 p-6 text-center">
			<p class="text-sm text-gray-600">No events recorded yet.</p>
			<p class="mt-2 text-xs text-gray-400">
				Data appears once the site is deployed with <code>FIREBASE_SERVICE_ACCOUNT</code> set and a page
				has been visited.
			</p>
		</div>
	{:else}
		<!-- Totals -->
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
			<div class="rounded-sm border border-gray-200 p-4">
				<span class="block text-xs tracking-wide text-gray-500 uppercase">Page views</span>
				<span class="mt-1 block font-serif text-2xl font-bold text-black">{total}</span>
			</div>
			<div class="rounded-sm border border-gray-200 p-4">
				<span class="block text-xs tracking-wide text-gray-500 uppercase">QR scans</span>
				<span class="mt-1 block font-serif text-2xl font-bold text-black">{qrScans}</span>
			</div>
			<div class="rounded-sm border border-gray-200 p-4">
				<span class="block text-xs tracking-wide text-gray-500 uppercase">Mobile</span>
				<span class="mt-1 block font-serif text-2xl font-bold text-black">
					{byDevice.find(([d]) => d === 'mobile')?.[1] ?? 0}
				</span>
			</div>
			<div class="rounded-sm border border-gray-200 p-4">
				<span class="block text-xs tracking-wide text-gray-500 uppercase">Window</span>
				<span class="mt-1 block font-serif text-2xl font-bold text-black">{days}d</span>
			</div>
		</div>

		<!-- Daily bars -->
		<div class="rounded-sm border border-gray-200 p-4">
			<span class="mb-3 block text-xs tracking-wide text-gray-500 uppercase">Views per day</span>
			<div class="flex h-24 items-end gap-[2px]">
				{#each daily as [date, count] (date)}
					<div
						class="flex-1 rounded-t-sm bg-gray-800 transition-colors hover:bg-black"
						style="height: {Math.max(2, (count / peak) * 100)}%"
						title="{date}: {count}"
					></div>
				{/each}
			</div>
		</div>

		<!-- QR scans by source -->
		<div class="rounded-sm border border-gray-200 p-4">
			<span class="mb-3 block text-xs tracking-wide text-gray-500 uppercase"
				>QR scans by source</span
			>
			{#if bySource.length === 0}
				<p class="text-sm text-gray-500">
					No QR scans yet — codes generated here are tagged
					<code>utm_medium=qr</code>, so they'll show up here once scanned.
				</p>
			{:else}
				<ul class="space-y-2">
					{#each bySource as [source, count] (source)}
						<li class="flex items-center gap-3">
							<span class="w-32 truncate text-sm text-gray-700">{source}</span>
							<div class="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
								<div class="h-full bg-black" style="width: {(count / bySource[0][1]) * 100}%"></div>
							</div>
							<span class="w-10 text-right text-sm font-medium text-gray-900">{count}</span>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<!-- Top pages + referrers -->
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="rounded-sm border border-gray-200 p-4">
				<span class="mb-3 block text-xs tracking-wide text-gray-500 uppercase">Top pages</span>
				<ul class="space-y-1.5">
					{#each byPath as [p, count] (p)}
						<li class="flex justify-between gap-3 text-sm">
							<span class="truncate text-gray-700">{p}</span>
							<span class="font-medium text-gray-900">{count}</span>
						</li>
					{/each}
				</ul>
			</div>
			<div class="rounded-sm border border-gray-200 p-4">
				<span class="mb-3 block text-xs tracking-wide text-gray-500 uppercase">Referrers</span>
				{#if byReferrer.length === 0}
					<p class="text-sm text-gray-500">Direct traffic only.</p>
				{:else}
					<ul class="space-y-1.5">
						{#each byReferrer as [host, count] (host)}
							<li class="flex justify-between gap-3 text-sm">
								<span class="truncate text-gray-700">{host}</span>
								<span class="font-medium text-gray-900">{count}</span>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</div>

		<!-- Location -->
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="rounded-sm border border-gray-200 p-4">
				<span class="mb-3 block text-xs tracking-wide text-gray-500 uppercase">Countries</span>
				{#if byCountry.length === 0}
					<p class="text-sm text-gray-500">No location data yet.</p>
				{:else}
					<ul class="space-y-1.5">
						{#each byCountry as [code, count] (code)}
							<li class="flex justify-between gap-3 text-sm">
								<span class="truncate text-gray-700">{flag(code)} {code}</span>
								<span class="font-medium text-gray-900">{count}</span>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
			<div class="rounded-sm border border-gray-200 p-4">
				<span class="mb-3 block text-xs tracking-wide text-gray-500 uppercase">Cities</span>
				{#if byCity.length === 0}
					<p class="text-sm text-gray-500">No location data yet.</p>
				{:else}
					<ul class="space-y-1.5">
						{#each byCity as [place, count] (place)}
							<li class="flex justify-between gap-3 text-sm">
								<span class="truncate text-gray-700">{place}</span>
								<span class="font-medium text-gray-900">{count}</span>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</div>

		<!-- Tech -->
		<div class="grid gap-4 sm:grid-cols-3">
			{#each [['Browser', byBrowser], ['OS', byOs], ['Language', byLanguage]] as [label, rows] (label)}
				<div class="rounded-sm border border-gray-200 p-4">
					<span class="mb-3 block text-xs tracking-wide text-gray-500 uppercase">{label}</span>
					{#if (rows as [string, number][]).length === 0}
						<p class="text-sm text-gray-500">—</p>
					{:else}
						<ul class="space-y-1.5">
							{#each rows as [name, count] (name)}
								<li class="flex justify-between gap-3 text-sm">
									<span class="truncate text-gray-700">{name}</span>
									<span class="font-medium text-gray-900">{count}</span>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/each}
		</div>

		<p class="text-xs text-gray-400">
			No IP addresses, cookies, or fingerprints are stored. Location is derived at the CDN edge and
			kept coarse (country / region / city), and the viewport is bucketed rather than exact. Your
			own visits are excluded while signed in, and visitors sending Do Not Track are never recorded.
		</p>
	{/if}
</div>
