import type { DashboardHeader } from '$lib/dashboard/shell/header/types';
import type { MyDealsDetailRouteRef, MyDealsListRouteRef } from '$lib/dashboard/routing';
import { resolveMyDealsDetailPath } from '$lib/dashboard/routing/my-deals';
import type { CanvasHeroData } from '$lib/dashboard/ui/detail/CanvasHero.types';
import type {
	MyDealsDetailReadModel,
	MyDealsDetailRef,
	MyDealsFeedItemReadModel,
	MyDealsListReadModel
} from '$lib/dashboard/read-models';
import type { BrokerKey } from '$lib/types/keys';
import { createMyDealsDetailHeader, createMyDealsListHeader } from './headers';

const MY_DEALS_NEWS_HERO = {
	title: "This week's news",
	description:
		"Get a quick overview of this week's news across the deals you are working on."
} as const satisfies CanvasHeroData;

type MyDealsNavigation =
	| {
			kind: 'internal';
			href: ReturnType<typeof resolveMyDealsDetailPath>;
	  }
	| {
			kind: 'none';
	  };

function toDetailNavigation(
	route: MyDealsListRouteRef,
	detail: MyDealsDetailRef | null
): MyDealsNavigation {
	if (!detail) {
		return {
			kind: 'none'
		};
	}

	return {
		kind: 'internal',
		href: resolveMyDealsDetailPath({
			dealKey: detail.dealKey,
			view: route.view,
			tab: detail.defaultTab
		})
	};
}

function toFeedItemNavigation(
	route: MyDealsListRouteRef,
	item: MyDealsFeedItemReadModel
): MyDealsNavigation {
	if (item.kind !== 'activity') {
		return {
			kind: 'none'
		};
	}

	return {
		kind: 'internal',
		href: resolveMyDealsDetailPath({
			dealKey: item.detail.dealKey,
			view: route.view,
			tab: item.detail.defaultTab
		})
	};
}

export type MyDealsFeedItemPageData = {
	id: string;
	title: string;
	kind: MyDealsFeedItemReadModel['kind'];
	dateIso: MyDealsFeedItemReadModel['dateIso'];
	navigation: MyDealsNavigation;
};

export type MyDealsTableRowPageData = Omit<MyDealsListReadModel['rows'][number], 'detail'> & {
	navigation: MyDealsNavigation;
};

export type MyDealsListPageData = {
	route: MyDealsListRouteRef;
	header: DashboardHeader;
	hero?: CanvasHeroData;
	activeBrokerKey: BrokerKey;
	rows: MyDealsTableRowPageData[];
	newsItems: MyDealsFeedItemPageData[];
	watchlistItems: MyDealsFeedItemPageData[];
};

export type MyDealsDetailPageData = {
	route: MyDealsDetailRouteRef;
	header: DashboardHeader;
	hero: MyDealsDetailReadModel['hero'];
	newsItems: MyDealsFeedItemPageData[];
	activityItems: MyDealsDetailReadModel['activityItems'];
	update: MyDealsDetailReadModel['update'];
	rightRail: MyDealsDetailReadModel['rightRail'];
};

export function buildMyDealsListPageData(params: {
	route: MyDealsListRouteRef;
	readModel: MyDealsListReadModel;
	activeBrokerKey: BrokerKey;
}): MyDealsListPageData {
	const { route, readModel, activeBrokerKey } = params;

	return {
		route,
		header: createMyDealsListHeader(route.view),
		hero: route.view === 'news' ? MY_DEALS_NEWS_HERO : undefined,
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

export function buildMyDealsDetailPageData(params: {
	route: MyDealsDetailRouteRef;
	readModel: MyDealsDetailReadModel;
}): MyDealsDetailPageData {
	const { route, readModel } = params;

	return {
		route,
		header: createMyDealsDetailHeader(readModel.title, route.view),
		hero: readModel.hero,
		newsItems: readModel.newsItems.map((item) => ({
			id: item.id,
			title: item.title,
			kind: item.kind,
			dateIso: item.dateIso,
			navigation: {
				kind: 'none'
			}
		})),
		activityItems: readModel.activityItems,
		update: readModel.update,
		rightRail: readModel.rightRail
	};
}
