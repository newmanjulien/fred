<script lang="ts">
	import { Activity, CalendarDays, Rss } from 'lucide-svelte';
	import EmptyStateCard from '$lib/dashboard/ui/shared/EmptyStateCard.svelte';

	import type { FeedTabId } from './feed-tabs';

	type EmptyStateIcon = 'news' | 'activity' | 'calendar';

	type EmptyStateContent = {
		title: string;
		description: string;
		icon: EmptyStateIcon;
		iconClass?: string;
	};

	const EMPTY_STATE_CONTENT: Record<FeedTabId, EmptyStateContent> = {
		news: {
			title: 'No updates this week',
			description:
				'News coverage and LinkedIn updates for companies in your accounts will show up here as new items come in.',
			icon: 'news',
			iconClass: 'size-4'
		},
		watchlist: {
			title: 'No watchlist activity yet',
			description:
				'Updates from accounts you follow in My accounts but do not own will appear here once there is activity to monitor.',
			icon: 'activity',
			iconClass: 'size-4'
		},
		upcoming: {
			title: 'No upcoming updates',
			description: 'We predict updates your team will ask for so you can prepare them ahead of time',
			icon: 'calendar',
			iconClass: 'size-4'
		}
	};

	let { tab }: { tab: FeedTabId } = $props();

	const content = $derived(EMPTY_STATE_CONTENT[tab]);
</script>

<section class="pt-1">
	<EmptyStateCard title={content.title} description={content.description}>
		{#snippet icon()}
			{#if content.icon === 'news'}
				<Rss class={content.iconClass ?? 'size-4'} />
			{:else if content.icon === 'activity'}
				<Activity class={content.iconClass ?? 'size-4'} />
			{:else}
				<CalendarDays class={content.iconClass ?? 'size-4'} />
			{/if}
		{/snippet}
	</EmptyStateCard>
</section>
