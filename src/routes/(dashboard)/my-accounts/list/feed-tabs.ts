import type { MyAccountsListPageData } from '$lib/dashboard/page-models/myAccounts';

type MyAccountsFeedItem = MyAccountsListPageData['newsItems'][number];

export type FeedTabId = 'news' | 'linkedin' | 'watchlist';

type MyAccountsFeedTabs = {
	initialTabId: FeedTabId;
	newsItems: readonly MyAccountsFeedItem[];
	linkedinItems: readonly MyAccountsFeedItem[];
};

export function buildMyAccountsFeedTabs(
	newsFeedItems: readonly MyAccountsFeedItem[],
	watchlistItems: readonly MyAccountsFeedItem[]
): MyAccountsFeedTabs {
	const newsItems = newsFeedItems.filter((item) => item.kind === 'news');
	const linkedinItems = newsFeedItems.filter((item) => item.kind === 'linkedin');

	return {
		initialTabId:
			newsItems.length > 0
				? 'news'
				: linkedinItems.length > 0
					? 'linkedin'
					: watchlistItems.length > 0
						? 'watchlist'
						: 'news',
		newsItems,
		linkedinItems
	};
}
