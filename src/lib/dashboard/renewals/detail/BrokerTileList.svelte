<script lang="ts">
	import type { RenewalsDetailPageData } from '$lib/dashboard/page-models/renewals';
	import PersonAvatar from '$lib/dashboard/ui/people/PersonAvatar.svelte';
	import ListCard from '$lib/dashboard/ui/shared/ListCard.svelte';

	type BrokerTile = RenewalsDetailPageData['brokerTiles'][number];

	type Props = {
		tiles: readonly BrokerTile[];
	};

	let { tiles }: Props = $props();

	function getBrokerTitle(tile: BrokerTile) {
		return tile.division ? `${tile.name} - ${tile.division}` : tile.name;
	}
</script>

{#if tiles.length === 0}
	<p class="pt-1 text-xs leading-relaxed tracking-wide text-zinc-500">
		No brokers assigned to this renewal account.
	</p>
{:else}
	<ol class="space-y-2.5 pt-1">
		{#each tiles as tile (tile.key)}
			<li>
				<ListCard class="hover:bg-white">
					{#snippet body()}
						<div class="flex items-center gap-1.5">
							<PersonAvatar
								person={{ name: tile.name, avatar: tile.avatar }}
								size={20}
								class="border border-white bg-zinc-50"
							/>
							<h2 class="text-xs leading-snug tracking-wide text-zinc-800">
								{getBrokerTitle(tile)}
							</h2>
						</div>

						<div aria-hidden="true" class="mt-3.5 space-y-1.5">
							<div class="h-2 rounded-[3px] bg-zinc-200/90"></div>
							<div class="h-2 rounded-[3px] bg-zinc-200/90"></div>
							<div class="h-2 w-1/3 rounded-[3px] bg-zinc-200/90"></div>
						</div>
					{/snippet}
				</ListCard>
			</li>
		{/each}
	</ol>
{/if}
