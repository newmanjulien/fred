<script lang="ts">
	import type { MyDealsListPageData } from '$lib/dashboard/page-models/myDeals';
	import type { MyDealsView } from '$lib/dashboard/routing/my-deals';
	import DashboardPageLayout from '$lib/dashboard/layout/DashboardPageLayout.svelte';
	import DashboardTabbedPage from '$lib/dashboard/layout/DashboardTabbedPage.svelte';
	import DashboardHeaderScope from '$lib/dashboard/shell/header/DashboardHeaderScope.svelte';
	import type { DashboardHeaderUiScope } from '$lib/dashboard/shell/header/ui-controller';
	import InlineInfoBar from '$lib/dashboard/ui/shared/InlineInfoBar.svelte';
	import SectionTabPanel from '$lib/dashboard/ui/tabs/SectionTabPanel.svelte';
	import NewsList from './NewsList.svelte';
	import Table from './Table.svelte';
	import { buildMyDealsFeedTabs } from './feed-tabs';

	type Props = {
		data: MyDealsListPageData;
	};

	const HEADER_SCOPE_ID = 'my-deals-list';

	let { data }: Props = $props();
	const feedTabs = $derived(buildMyDealsFeedTabs(data.newsItems, data.watchlistItems));
	const tabs = [
		{ id: 'news', label: 'News' },
		{ id: 'linkedin', label: 'LinkedIn' },
		{ id: 'watchlist', label: 'Watchlist' }
	] as const;

	function getMyDealsHeaderUiScope(selectedView: MyDealsView): DashboardHeaderUiScope | null {
		if (selectedView !== 'deals') {
			return null;
		}

		return {
			buttons: [
				{
					id: 'add-deal',
					label: 'Add deal',
					order: 10
				}
			]
		};
	}
</script>

<DashboardHeaderScope
	scopeId={HEADER_SCOPE_ID}
	scope={getMyDealsHeaderUiScope(data.route.view)}
/>

{#if data.route.view === 'news'}
	<DashboardTabbedPage
		hero={data.hero}
		width="normal"
		initialTabId={feedTabs.initialTabId}
		{tabs}
	>
		{#snippet body()}
			<SectionTabPanel tabId="news">
				<NewsList items={feedTabs.newsItems} />
			</SectionTabPanel>
			<SectionTabPanel tabId="linkedin">
				<NewsList items={feedTabs.linkedinItems} emptyStateTab="linkedin" />
			</SectionTabPanel>
			<SectionTabPanel tabId="watchlist">
				<NewsList
					items={data.watchlistItems}
					emptyStateTab="watchlist"
					infoBarText="Watchlist shows activity from deals you follow in My deals but do not own."
				/>
			</SectionTabPanel>
		{/snippet}
	</DashboardTabbedPage>
{:else}
	<DashboardPageLayout width="wide">
		{#snippet body()}
			<Table rows={data.rows} activeBrokerKey={data.activeBrokerKey} />
			{#if data.rows.length > 0}
				<InlineInfoBar
					dataAttribute="data-my-deals-deals-info-bar"
					text="We automatially reserve deals for you in Epic and deals which are reserved have a checkmark"
				/>
			{/if}
		{/snippet}
	</DashboardPageLayout>
{/if}
