import type { MyAccountsListPageData } from '$lib/dashboard/page-models/myAccounts';

type MyAccountsFeedItem = MyAccountsListPageData['newsItems'][number];

export type FeedTabId = 'news' | 'watchlist' | 'upcoming';

type MyAccountsFeedTabs = {
	initialTabId: FeedTabId;
	newsItems: readonly MyAccountsFeedItem[];
};

export function buildMyAccountsFeedTabs(
	newsFeedItems: readonly MyAccountsFeedItem[],
	watchlistItems: readonly MyAccountsFeedItem[]
): MyAccountsFeedTabs {
	return {
		initialTabId: newsFeedItems.length > 0 ? 'news' : watchlistItems.length > 0 ? 'watchlist' : 'news',
		newsItems: newsFeedItems
	};
}
