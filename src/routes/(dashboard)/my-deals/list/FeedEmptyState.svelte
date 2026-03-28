<script lang="ts">
	import { Activity, Rss } from 'lucide-svelte';
	import LinkedInGlyph from '$lib/dashboard/ui/icons/LinkedInGlyph.svelte';
	import EmptyStateCard from '$lib/dashboard/ui/shared/EmptyStateCard.svelte';

	import type { FeedTabId } from './feed-tabs';

	type EmptyStateContent = {
		title: string;
		description: string;
	};

	const EMPTY_STATE_CONTENT: Record<FeedTabId, EmptyStateContent> = {
		news: {
			title: 'No news this week',
			description: 'Coverage for companies in your deals will show up here as new updates come in.'
		},
		linkedin: {
			title: 'No LinkedIn updates yet',
			description:
				'This tab will fill with company posts, contact moves, and hiring updates once LinkedIn coverage is available for your deals.'
		},
		watchlist: {
			title: 'No watchlist activity yet',
			description:
				'Updates from deals you follow in My deals but do not own will appear here once there is activity to monitor.'
		}
	};

	let { tab }: { tab: FeedTabId } = $props();

	const content = $derived(EMPTY_STATE_CONTENT[tab]);
</script>

<section class="pt-1">
	<EmptyStateCard title={content.title} description={content.description}>
		{#snippet icon()}
			{#if tab === 'linkedin'}
				<LinkedInGlyph class="size-4" />
			{:else if tab === 'watchlist'}
				<Activity class="size-4" />
			{:else}
				<Rss class="size-4" />
			{/if}
		{/snippet}
	</EmptyStateCard>
</section>
