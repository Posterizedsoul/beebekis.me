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
		<h1 class="text-2xl font-semibold text-gray-900">Memories</h1>
		<p class="mt-2 text-sm text-gray-700">A list of all your photo albums and memories.</p>
	</div>
	<div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
		<a
			href="/admin/memories/new"
			class="block rounded-md bg-black px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
		>
			Add Memory
		</a>
	</div>
</div>

<div class="mt-8 flex flex-col">
	<div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
		<div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
			<div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
				<table class="min-w-full divide-y divide-gray-300">
					<thead class="bg-gray-50">
						<tr>
							<th
								scope="col"
								class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
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
							<th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
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
										class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6"
									>
										<a
											href="/memories/{memory.slug}"
											target="_blank"
											class="hover:text-indigo-600 hover:underline">{memory.title}</a
										>
									</td>
									<td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
										>{memory.date.toLocaleDateString()}</td
									>
									<td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{memory.slug}</td>
									<td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
										>{memory.imageCount}</td
									>
									<td
										class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
									>
										<a
											href="/admin/memories/{memory.id}"
											class="text-indigo-600 hover:text-indigo-900"
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
