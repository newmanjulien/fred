<script lang="ts">
	import type { MyAccountsListPageData } from '$lib/dashboard/page-models/myAccounts';
	import type { MyAccountsView } from '$lib/dashboard/routing/my-accounts';
	import DashboardPageLayout from '$lib/dashboard/layout/DashboardPageLayout.svelte';
	import DashboardTabbedPage from '$lib/dashboard/layout/DashboardTabbedPage.svelte';
	import DashboardHeaderScope from '$lib/dashboard/shell/header/DashboardHeaderScope.svelte';
	import type { DashboardHeaderUiScope } from '$lib/dashboard/shell/header/ui-controller';
	import SectionTabPanel from '$lib/dashboard/ui/tabs/SectionTabPanel.svelte';
	import NewsList from './NewsList.svelte';
	import Table from './Table.svelte';
	import { buildMyAccountsFeedTabs } from './feed-tabs';

	const WATCHLIST_INFO_BAR_TEXT =
		'Watchlist shows activity from accounts you follow in My accounts but do not own.';

	type Props = {
		data: MyAccountsListPageData;
	};

	const HEADER_SCOPE_ID = 'my-accounts-list';

	let { data }: Props = $props();
	const feedTabs = $derived(buildMyAccountsFeedTabs(data.newsItems, data.watchlistItems));
	const tabs = [
		{ id: 'news', label: 'News' },
		{ id: 'watchlist', label: 'Watchlist' },
		{ id: 'upcoming', label: 'Upcoming' }
	] as const;

	function getMyAccountsHeaderUiScope(selectedView: MyAccountsView): DashboardHeaderUiScope | null {
		if (selectedView !== 'accounts') {
			return null;
		}

		return {
			buttons: [
				{
					id: 'add-account',
					label: 'Add account',
					order: 10
				}
			]
		};
	}
</script>

<DashboardHeaderScope
	scopeId={HEADER_SCOPE_ID}
	scope={getMyAccountsHeaderUiScope(data.route.view)}
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
			<SectionTabPanel tabId="watchlist">
				<NewsList
					items={data.watchlistItems}
					emptyStateTab="watchlist"
					infoBarText={WATCHLIST_INFO_BAR_TEXT}
				/>
			</SectionTabPanel>
			<SectionTabPanel tabId="upcoming">
				<NewsList items={[]} emptyStateTab="upcoming" />
			</SectionTabPanel>
		{/snippet}
	</DashboardTabbedPage>
{:else}
	<DashboardPageLayout width="wide">
		{#snippet body()}
			<Table rows={data.rows} activeBrokerKey={data.activeBrokerKey} />
		{/snippet}
	</DashboardPageLayout>
{/if}
