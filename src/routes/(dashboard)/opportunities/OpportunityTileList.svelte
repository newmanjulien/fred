<script lang="ts">
	import type { OpportunitiesListPageData } from '$lib/dashboard/page-models/opportunities';
	import { Building } from 'lucide-svelte';
	import { formatDealNumber } from '$lib/dashboard/view-models/deal';
	import type { CanvasHeroIcon } from '$lib/dashboard/ui/detail/CanvasHero.types';
	import ActivityLevelLabel from '$lib/dashboard/ui/activity-level/ActivityLevelLabel.svelte';
	import AvatarStack from '$lib/dashboard/ui/people/AvatarStack.svelte';
	import ListCard from '$lib/dashboard/ui/shared/ListCard.svelte';

	type OpportunityTile = OpportunitiesListPageData['opportunityTiles'][number];

	type Props = {
		tiles: readonly OpportunityTile[];
		icon: CanvasHeroIcon;
	};

	let { tiles, icon: Icon }: Props = $props();
</script>

<ol class="space-y-2.5 pt-1">
	{#each tiles as tile (tile.key)}
		{@const hasBottomMeta = Boolean(tile.dealLabel || tile.activityLevel)}
		<li>
			<ListCard link={{ kind: 'opportunities', href: tile.href }}>
				{#snippet body()}
					<div class="flex items-start justify-between gap-3">
						<p class="text-[10px] tracking-wide text-zinc-500">
							{formatDealNumber(tile.dealNumber)}
						</p>
						{#if tile.avatars}
							<AvatarStack
								avatars={tile.avatars}
								altBase={tile.title}
								size={20}
								avatarClass="border border-white bg-zinc-50"
							/>
						{/if}
					</div>

					<div class="mt-2 flex items-center gap-1.5">
						<Icon class="size-3 text-zinc-500" />
						<h2 class="text-xs leading-snug tracking-wide text-zinc-800">{tile.title}</h2>
					</div>

					<div class="mt-3.5 space-y-1.5">
						<div class="h-2 rounded-[3px] bg-zinc-200/90"></div>
						<div class="h-2 rounded-[3px] bg-zinc-200/90"></div>
						<div class="h-2 w-1/3 rounded-[3px] bg-zinc-200/90"></div>
					</div>

					{#if hasBottomMeta}
						<div class="mt-4 flex flex-wrap items-center gap-1.5">
							{#if tile.dealLabel}
								<span class="inline-flex items-center gap-1 rounded-md border border-zinc-100 px-2 py-0.5 text-[11px] tracking-wide text-zinc-800">
									<Building aria-hidden="true" class="size-2.5 text-zinc-400" />
									{tile.dealLabel}
								</span>
							{/if}
							{#if tile.activityLevel}
								<ActivityLevelLabel activityLevel={tile.activityLevel} />
							{/if}
						</div>
					{/if}
				{/snippet}
			</ListCard>
		</li>
	{/each}
</ol>
