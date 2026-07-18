<script lang="ts">
	import { db } from '$lib/firebase';
	import { collection, getDocs, query, orderBy } from 'firebase/firestore';
	import { onMount } from 'svelte';

	// Type definition
	interface Memory {
		id: string;
		title: string;
		date: Date;
		slug: string;
		imageCount: number;
	}

	let memories: Memory[] = $state([]);
	let loading = $state(true);

	onMount(async () => {
		try {
			const q = query(collection(db, 'memories'), orderBy('date', 'desc'));
			const querySnapshot = await getDocs(q);

			memories = querySnapshot.docs.map((doc) => {
				const data = doc.data();
				return {
					id: doc.id,
					title: data.title,
					date: data.date?.toDate() || new Date(), // Handle Firestore Timestamp
					slug: data.slug,
					imageCount: data.images?.length || 0
				};
			});
		} catch (err) {
			console.error('Error fetching memories:', err);
		} finally {
			loading = false;
		}
	});
</script>

<div class="sm:flex sm:items-center">
	<div class="sm:flex-auto">
		<h1 class="font-serif text-3xl font-bold tracking-wide text-black uppercase">Memories</h1>
		<p class="mt-2 text-sm text-gray-500">A list of all your photo albums and memories.</p>
	</div>
	<div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
		<a
			href="/admin/memories/new"
			class="block rounded-sm border border-black bg-black px-4 py-2 text-center font-serif text-sm font-medium tracking-wider text-white uppercase transition-colors hover:bg-gray-800"
		>
			Add Memory
		</a>
	</div>
</div>

<div class="mt-8 flex flex-col">
	<div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
		<div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
			<div class="overflow-hidden rounded-sm border border-gray-200 bg-white">
				<table class="min-w-full divide-y divide-gray-300">
					<thead class="bg-gray-50">
						<tr>
							<th
								scope="col"
								class="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6"
								>Title</th
							>
							<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
								>Date</th
							>
							<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
								>Slug</th
							>
							<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
								>Images</th
							>
							<th scope="col" class="relative py-3.5 pr-4 pl-3 sm:pr-6">
								<span class="sr-only">Edit</span>
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200 bg-white">
						{#if loading}
							<tr>
								<td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500"
									>Loading memories...</td
								>
							</tr>
						{:else if memories.length === 0}
							<tr>
								<td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500"
									>No memories found. Create one!</td
								>
							</tr>
						{:else}
							{#each memories as memory}
								<tr>
									<td
										class="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6"
									>
										<a href="/memories/{memory.slug}" target="_blank" class="hover:underline"
											>{memory.title}</a
										>
									</td>
									<td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500"
										>{memory.date.toLocaleDateString()}</td
									>
									<td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500">{memory.slug}</td>
									<td class="px-3 py-4 text-sm whitespace-nowrap text-gray-500"
										>{memory.imageCount}</td
									>
									<td
										class="relative py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-6"
									>
										<a
											href="/admin/memories/{memory.id}"
											class="font-medium text-black hover:underline"
											>Edit<span class="sr-only">, {memory.title}</span></a
										>
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
