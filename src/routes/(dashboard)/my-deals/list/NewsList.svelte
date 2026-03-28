<script lang="ts">
	import { formatIsoDate } from '$lib/format/date-time';
	import type { MyDealsListPageData } from '$lib/dashboard/page-models/myDeals';
	import { Activity, Rss } from 'lucide-svelte';
	import LinkedInGlyph from '$lib/dashboard/ui/icons/LinkedInGlyph.svelte';
	import InlineInfoBar from '$lib/dashboard/ui/shared/InlineInfoBar.svelte';
	import ListCard from '$lib/dashboard/ui/shared/ListCard.svelte';
	import FeedEmptyState from './FeedEmptyState.svelte';
	import type { FeedTabId } from './feed-tabs';

	type MyDealsFeedItem = MyDealsListPageData['newsItems'][number];

	type Props = {
		items: readonly MyDealsFeedItem[];
		emptyStateTab?: FeedTabId;
		infoBarText?: string;
	};

	let { items, emptyStateTab = 'news', infoBarText }: Props = $props();
</script>

{#if items.length === 0}
	<FeedEmptyState tab={emptyStateTab} />
{:else}
	<div class="pt-1">
		<ol class="space-y-2.5">
			{#each items as item (item.id)}
				<li>
					<ListCard
						link={item.navigation.kind === 'internal'
							? {
									kind: 'my-deals',
									href: item.navigation.href
								}
							: {
									kind: 'none'
								}}
					>
						{#snippet body()}
							<div class="flex items-start justify-between gap-3">
								<div class="flex min-w-0 items-start gap-1.5">
									{#if item.kind === 'linkedin'}
										<LinkedInGlyph class="mt-0.5 size-3 shrink-0 text-zinc-500" />
									{:else if item.kind === 'activity'}
										<Activity class="mt-0.5 size-3 shrink-0 text-zinc-500" />
									{:else}
										<Rss class="mt-0.5 size-3 shrink-0 text-zinc-500" />
									{/if}
									<h2 class="min-w-0 text-xs leading-snug tracking-wide text-zinc-800">{item.title}</h2>
								</div>
								<p class="shrink-0 text-[11px] tracking-wide text-zinc-400">
									{formatIsoDate(item.dateIso)}
								</p>
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
		{#if infoBarText}
			<InlineInfoBar
				dataAttribute="data-my-deals-watchlist-info-bar"
				text={infoBarText}
			/>
		{/if}
	</div>
{/if}
