import type { DashboardHeader } from '$lib/dashboard/shell/header/types';
import type { MyAccountsDetailRouteRef, MyAccountsListRouteRef } from '$lib/dashboard/routing';
import { resolveMyAccountsDetailPath } from '$lib/dashboard/routing/my-accounts';
import type { AbsoluteUrl } from '$lib/types/url';
import { parseAbsoluteUrl } from '$lib/types/url';
import type { CanvasHeroData } from '$lib/dashboard/ui/detail/CanvasHero.types';
import type {
	MyAccountsDetailReadModel,
	MyAccountsDetailRef,
	MyAccountsFeedItemReadModel,
	MyAccountsListReadModel
} from '$lib/dashboard/read-models';
import type { BrokerKey } from '$lib/types/keys';
import { createMyAccountsDetailHeader, createMyAccountsListHeader } from './headers';

const MY_ACCOUNTS_NEWS_HERO = {
	title: "This week's news",
	description:
		"Get a quick overview of this week's news across the accounts you are working on."
} as const satisfies CanvasHeroData;

type MyAccountsNavigation =
	| {
			kind: 'internal';
			href: ReturnType<typeof resolveMyAccountsDetailPath>;
	  }
	| {
			kind: 'external';
			href: AbsoluteUrl;
	  }
	| {
			kind: 'none';
	  };

function toDetailNavigation(
	route: MyAccountsListRouteRef,
	detail: MyAccountsDetailRef | null
): MyAccountsNavigation {
	if (!detail) {
		return {
			kind: 'none'
		};
	}

	return {
		kind: 'internal',
		href: resolveMyAccountsDetailPath({
			accountKey: detail.accountKey,
			view: route.view,
			tab: detail.defaultTab
		})
	};
}

function toFeedItemNavigation(
	route: MyAccountsListRouteRef,
	item: MyAccountsFeedItemReadModel
): MyAccountsNavigation {
	if (item.kind === 'activity') {
		return {
			kind: 'internal',
			href: resolveMyAccountsDetailPath({
				accountKey: item.detail.accountKey,
				view: route.view,
				tab: item.detail.defaultTab
			})
		};
	}

	const href = parseAbsoluteUrl(item.url);

	return href
		? {
				kind: 'external',
				href
			}
		: {
				kind: 'none'
			};
}

export type MyAccountsFeedItemPageData = {
	id: string;
	title: string;
	kind: MyAccountsFeedItemReadModel['kind'];
	dateIso: MyAccountsFeedItemReadModel['dateIso'];
	navigation: MyAccountsNavigation;
};

export type MyAccountsTableRowPageData = Omit<MyAccountsListReadModel['rows'][number], 'detail'> & {
	navigation: MyAccountsNavigation;
};

export type MyAccountsListPageData = {
	route: MyAccountsListRouteRef;
	header: DashboardHeader;
	hero?: CanvasHeroData;
	activeBrokerKey: BrokerKey;
	rows: MyAccountsTableRowPageData[];
	newsItems: MyAccountsFeedItemPageData[];
	watchlistItems: MyAccountsFeedItemPageData[];
};

export type MyAccountsDetailPageData = {
	route: MyAccountsDetailRouteRef;
	header: DashboardHeader;
	hero: MyAccountsDetailReadModel['hero'];
	newsItems: MyAccountsFeedItemPageData[];
	activityItems: MyAccountsDetailReadModel['activityItems'];
	update: MyAccountsDetailReadModel['update'];
	rightRail: MyAccountsDetailReadModel['rightRail'];
};

export function buildMyAccountsListPageData(params: {
	route: MyAccountsListRouteRef;
	readModel: MyAccountsListReadModel;
	activeBrokerKey: BrokerKey;
}): MyAccountsListPageData {
	const { route, readModel, activeBrokerKey } = params;

	return {
		route,
		header: createMyAccountsListHeader(route.view),
		hero: route.view === 'news' ? MY_ACCOUNTS_NEWS_HERO : undefined,
		activeBrokerKey,
		rows: readModel.rows.map((row) => {
			const { detail, ...rest } = row;

			return {
				...rest,
				navigation: toDetailNavigation(route, detail)
			};
		}),
		newsItems: readModel.newsItems.map((item) => ({
			id: item.id,
			title: item.title,
			kind: item.kind,
			dateIso: item.dateIso,
			navigation: toFeedItemNavigation(route, item)
		})),
		watchlistItems: readModel.watchlistItems.map((item) => ({
			id: item.id,
			title: item.title,
			kind: item.kind,
			dateIso: item.dateIso,
			navigation: toFeedItemNavigation(route, item)
		}))
	};
}

export function buildMyAccountsDetailPageData(params: {
	route: MyAccountsDetailRouteRef;
	readModel: MyAccountsDetailReadModel;
}): MyAccountsDetailPageData {
	const { route, readModel } = params;

	return {
		route,
		header: createMyAccountsDetailHeader(readModel.title, route.view),
		hero: readModel.hero,
		newsItems: readModel.newsItems.map((item) => ({
			id: item.id,
			title: item.title,
			kind: item.kind,
			dateIso: item.dateIso,
			navigation:
				item.kind === 'activity'
					? {
							kind: 'none'
						}
					: (() => {
							const href = parseAbsoluteUrl(item.url);

							return href
								? {
										kind: 'external' as const,
										href
									}
								: {
										kind: 'none' as const
									};
						})()
		})),
		activityItems: readModel.activityItems,
		update: readModel.update,
		rightRail: readModel.rightRail
	};
}
