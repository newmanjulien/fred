import type { MyDealsListPageData } from '$lib/dashboard/page-models/myDeals';

type MyDealsFeedItem = MyDealsListPageData['newsItems'][number];

export type FeedTabId = 'news' | 'linkedin' | 'watchlist';

type MyDealsFeedTabs = {
	initialTabId: FeedTabId;
	newsItems: readonly MyDealsFeedItem[];
	linkedinItems: readonly MyDealsFeedItem[];
};

export function buildMyDealsFeedTabs(
	newsFeedItems: readonly MyDealsFeedItem[],
	watchlistItems: readonly MyDealsFeedItem[]
): MyDealsFeedTabs {
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
