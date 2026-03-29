import type { AccountKey, InsightKey, MeetingKey } from '$lib/types/keys';
import {
	DEFAULT_MY_ACCOUNTS_DETAIL_TAB_ID,
	DEFAULT_MY_ACCOUNTS_VIEW,
	isMyAccountsDetailTabId,
	isNonDefaultMyAccountsView,
	resolveMyAccountsDetailPath,
	resolveMyAccountsListPath,
	type MyAccountsDetailTabId,
	type MyAccountsView
} from './my-accounts';
import {
	DEFAULT_NEW_BUSINESS_VIEW,
	isNonDefaultNewBusinessView,
	resolveNewBusinessDetailPath,
	resolveNewBusinessListPath,
	type NewBusinessView
} from './new-business';
import {
	DEFAULT_RENEWALS_VIEW,
	isNonDefaultRenewalsView,
	resolveRenewalsDetailPath,
	resolveRenewalsListPath,
	type RenewalsView
} from './renewals';
import {
	resolveOpportunitiesDetailPath,
	resolveOpportunitiesListPath
} from './opportunities';
import {
	resolveSinceLastMeetingDetailPath,
	resolveSinceLastMeetingPath
} from './since-last-meeting';
import type { DashboardPath } from './paths';

const DASHBOARD_ROUTE_IDS = {
	myAccountsList: ['/(dashboard)/my-accounts', '/(dashboard)/my-accounts/[view=myAccountsView]'],
	myAccountsDetail: [
		'/(dashboard)/my-accounts/detail/[accountKey]',
		'/(dashboard)/my-accounts/[view=myAccountsView]/detail/[accountKey]'
	],
	newBusinessList: [
		'/(dashboard)/new-business',
		'/(dashboard)/new-business/[view=newBusinessView]'
	],
	newBusinessDetail: [
		'/(dashboard)/new-business/detail/[accountKey]',
		'/(dashboard)/new-business/[view=newBusinessView]/detail/[accountKey]'
	],
	renewalsList: ['/(dashboard)/renewals', '/(dashboard)/renewals/[view=renewalsView]'],
	renewalsDetail: [
		'/(dashboard)/renewals/detail/[accountKey]',
		'/(dashboard)/renewals/[view=renewalsView]/detail/[accountKey]'
	],
	opportunities: ['/(dashboard)/opportunities', '/(dashboard)/opportunities/detail/[insightKey]'],
	sinceLastMeeting: ['/(dashboard)/since-last-meeting'],
	sinceLastMeetingDetail: ['/(dashboard)/since-last-meeting/detail/[accountKey]']
} as const;

export type MyAccountsListRouteRef = {
	kind: 'my-accounts-list';
	view: MyAccountsView;
};

export type MyAccountsDetailRouteRef = {
	kind: 'my-accounts-detail';
	accountKey: AccountKey;
	view: MyAccountsView;
	tab: MyAccountsDetailTabId;
};

export type NewBusinessListRouteRef = {
	kind: 'new-business-list';
	view: NewBusinessView;
};

export type NewBusinessDetailRouteRef = {
	kind: 'new-business-detail';
	accountKey: AccountKey;
	view: NewBusinessView;
};

export type RenewalsListRouteRef = {
	kind: 'renewals-list';
	view: RenewalsView;
};

export type RenewalsDetailRouteRef = {
	kind: 'renewals-detail';
	accountKey: AccountKey;
	view: RenewalsView;
};

export type OpportunitiesListRouteRef = {
	kind: 'opportunities-list';
	meetingKey: MeetingKey | null;
};

export type OpportunitiesDetailRouteRef = {
	kind: 'opportunities-detail';
	insightKey: InsightKey;
	meetingKey: MeetingKey | null;
};

export type SinceLastMeetingRouteRef = {
	kind: 'since-last-meeting';
	meetingKey: MeetingKey | null;
};

export type SinceLastMeetingDetailRouteRef = {
	kind: 'since-last-meeting-detail';
	accountKey: AccountKey;
	meetingKey: MeetingKey | null;
};

export type DashboardNavRouteRef =
	| MyAccountsListRouteRef
	| NewBusinessListRouteRef
	| RenewalsListRouteRef
	| OpportunitiesListRouteRef
	| SinceLastMeetingRouteRef;

export type DashboardRouteRef =
	| DashboardNavRouteRef
	| MyAccountsDetailRouteRef
	| NewBusinessDetailRouteRef
	| RenewalsDetailRouteRef
	| OpportunitiesDetailRouteRef
	| SinceLastMeetingDetailRouteRef;

type DashboardLayoutRouteParams = {
	view?: string;
	accountKey?: string;
	insightKey?: string;
};

type DashboardLayoutRouteParseInput = {
	routeId: string;
	params: DashboardLayoutRouteParams;
	searchParams: URLSearchParams;
};

type DashboardRouteDefinition<TRoute extends DashboardRouteRef> = {
	routeIds: readonly string[];
	parse: (input: DashboardLayoutRouteParseInput) => TRoute | null;
};

type DashboardRouteDefinitionMap = {
	[K in DashboardRouteRef['kind']]: DashboardRouteDefinition<Extract<DashboardRouteRef, { kind: K }>>;
};

export const DEFAULT_DASHBOARD_ROUTE_REF: NewBusinessListRouteRef = {
	kind: 'new-business-list',
	view: DEFAULT_NEW_BUSINESS_VIEW
};

function hasOnlyAllowedSearchParams(
	searchParams: URLSearchParams,
	allowedKeys: readonly string[]
) {
	const allowedKeySet = new Set(allowedKeys);

	return [...searchParams.keys()].every((key) => allowedKeySet.has(key));
}

function resolveRequiredRouteParam(value: string | undefined) {
	return value && value.length > 0 ? value : null;
}

function resolveOptionalMeetingKey(searchParams: URLSearchParams) {
	const meetingKey = searchParams.get('meetingKey');

	return meetingKey && meetingKey.length > 0 ? (meetingKey as MeetingKey) : null;
}

function resolveMyAccountsDetailTab(searchParams: URLSearchParams): MyAccountsDetailTabId | null {
	if (!hasOnlyAllowedSearchParams(searchParams, ['tab'])) {
		return null;
	}

	const tab = searchParams.get('tab');

	if (tab === null) {
		return DEFAULT_MY_ACCOUNTS_DETAIL_TAB_ID;
	}

	return isMyAccountsDetailTabId(tab) ? tab : null;
}

function parseEmptySearchParams(searchParams: URLSearchParams) {
	return searchParams.size === 0 ? {} : null;
}

function createViewListRouteDefinition<TRoute extends DashboardRouteRef, TView extends string>(params: {
	routeIds: readonly [string, string];
	defaultView: TView;
	isNonDefaultView: (value: string) => boolean;
	build: (view: TView) => TRoute;
}): DashboardRouteDefinition<TRoute> {
	return {
		routeIds: params.routeIds,
		parse: ({ routeId, params: routeParams, searchParams }) => {
			if (searchParams.size > 0) {
				return null;
			}

			if (routeId === params.routeIds[0]) {
				return params.build(params.defaultView);
			}

			const view = routeParams.view;

			if (!view || !params.isNonDefaultView(view)) {
				return null;
			}

			return params.build(view as TView);
		}
	};
}

function createViewDetailRouteDefinition<
	TRoute extends DashboardRouteRef,
	TView extends string,
	TExtra extends object = {}
>(params: {
	routeIds: readonly [string, string];
	defaultView: TView;
	isNonDefaultView: (value: string) => boolean;
	parseSearchParams?: (searchParams: URLSearchParams) => TExtra | null;
	build: (input: { accountKey: AccountKey; view: TView } & TExtra) => TRoute;
}): DashboardRouteDefinition<TRoute> {
	const parseSearchParams =
		params.parseSearchParams ??
		(parseEmptySearchParams as (searchParams: URLSearchParams) => TExtra | null);

	return {
		routeIds: params.routeIds,
		parse: ({ routeId, params: routeParams, searchParams }) => {
			const accountKey = resolveRequiredRouteParam(routeParams.accountKey);

			if (!accountKey) {
				return null;
			}

			const extra = parseSearchParams(searchParams);

			if (!extra) {
				return null;
			}

			if (routeId === params.routeIds[0]) {
				return params.build(
					{
						accountKey: accountKey as AccountKey,
						view: params.defaultView,
						...extra
					} as { accountKey: AccountKey; view: TView } & TExtra
				);
			}

			const view = routeParams.view;

			if (!view || !params.isNonDefaultView(view)) {
				return null;
			}

			return params.build(
				{
					accountKey: accountKey as AccountKey,
					view: view as TView,
					...extra
				} as { accountKey: AccountKey; view: TView } & TExtra
			);
		}
	};
}

const dashboardRouteDefinitions = {
	'my-accounts-list': createViewListRouteDefinition({
		routeIds: DASHBOARD_ROUTE_IDS.myAccountsList,
		defaultView: DEFAULT_MY_ACCOUNTS_VIEW,
		isNonDefaultView: isNonDefaultMyAccountsView,
		build: (view) => ({
			kind: 'my-accounts-list',
			view
		})
	}),
	'my-accounts-detail': createViewDetailRouteDefinition({
		routeIds: DASHBOARD_ROUTE_IDS.myAccountsDetail,
		defaultView: DEFAULT_MY_ACCOUNTS_VIEW,
		isNonDefaultView: isNonDefaultMyAccountsView,
		parseSearchParams: (searchParams) => {
			const tab = resolveMyAccountsDetailTab(searchParams);
			return tab ? { tab } : null;
		},
		build: ({ accountKey, view, tab }) => ({
			kind: 'my-accounts-detail',
			accountKey,
			view,
			tab
		})
	}),
	'new-business-list': createViewListRouteDefinition({
		routeIds: DASHBOARD_ROUTE_IDS.newBusinessList,
		defaultView: DEFAULT_NEW_BUSINESS_VIEW,
		isNonDefaultView: isNonDefaultNewBusinessView,
		build: (view) => ({
			kind: 'new-business-list',
			view
		})
	}),
	'new-business-detail': createViewDetailRouteDefinition({
		routeIds: DASHBOARD_ROUTE_IDS.newBusinessDetail,
		defaultView: DEFAULT_NEW_BUSINESS_VIEW,
		isNonDefaultView: isNonDefaultNewBusinessView,
		build: ({ accountKey, view }) => ({
			kind: 'new-business-detail',
			accountKey,
			view
		})
	}),
	'renewals-list': createViewListRouteDefinition({
		routeIds: DASHBOARD_ROUTE_IDS.renewalsList,
		defaultView: DEFAULT_RENEWALS_VIEW,
		isNonDefaultView: isNonDefaultRenewalsView,
		build: (view) => ({
			kind: 'renewals-list',
			view
		})
	}),
	'renewals-detail': createViewDetailRouteDefinition({
		routeIds: DASHBOARD_ROUTE_IDS.renewalsDetail,
		defaultView: DEFAULT_RENEWALS_VIEW,
		isNonDefaultView: isNonDefaultRenewalsView,
		build: ({ accountKey, view }) => ({
			kind: 'renewals-detail',
			accountKey,
			view
		})
	}),
	'opportunities-list': {
		routeIds: [DASHBOARD_ROUTE_IDS.opportunities[0]],
		parse: ({ searchParams }) => {
			if (!hasOnlyAllowedSearchParams(searchParams, ['meetingKey'])) {
				return null;
			}

			return {
				kind: 'opportunities-list',
				meetingKey: resolveOptionalMeetingKey(searchParams)
			};
		}
	},
	'opportunities-detail': {
		routeIds: [DASHBOARD_ROUTE_IDS.opportunities[1]],
		parse: ({ params, searchParams }) => {
			if (!hasOnlyAllowedSearchParams(searchParams, ['meetingKey'])) {
				return null;
			}

			const insightKey = resolveRequiredRouteParam(params.insightKey);

			if (!insightKey) {
				return null;
			}

			return {
				kind: 'opportunities-detail',
				insightKey: insightKey as InsightKey,
				meetingKey: resolveOptionalMeetingKey(searchParams)
			};
		}
	},
	'since-last-meeting': {
		routeIds: DASHBOARD_ROUTE_IDS.sinceLastMeeting,
		parse: ({ searchParams }) => {
			if (!hasOnlyAllowedSearchParams(searchParams, ['meetingKey'])) {
				return null;
			}

			return {
				kind: 'since-last-meeting',
				meetingKey: resolveOptionalMeetingKey(searchParams)
			};
		}
	},
	'since-last-meeting-detail': {
		routeIds: DASHBOARD_ROUTE_IDS.sinceLastMeetingDetail,
		parse: ({ params, searchParams }) => {
			if (!hasOnlyAllowedSearchParams(searchParams, ['meetingKey'])) {
				return null;
			}

			const accountKey = resolveRequiredRouteParam(params.accountKey);

			if (!accountKey) {
				return null;
			}

			return {
				kind: 'since-last-meeting-detail',
				accountKey: accountKey as AccountKey,
				meetingKey: resolveOptionalMeetingKey(searchParams)
			};
		}
	}
} satisfies DashboardRouteDefinitionMap;

const dashboardRouteDefinitionEntries = Object.values(
	dashboardRouteDefinitions
) as DashboardRouteDefinition<DashboardRouteRef>[];

export function resolveDashboardRoute(route: DashboardRouteRef): DashboardPath {
	switch (route.kind) {
		case 'my-accounts-list':
			return resolveMyAccountsListPath(route.view);
		case 'my-accounts-detail':
			return resolveMyAccountsDetailPath(route);
		case 'new-business-list':
			return resolveNewBusinessListPath(route.view);
		case 'new-business-detail':
			return resolveNewBusinessDetailPath(route);
		case 'renewals-list':
			return resolveRenewalsListPath(route.view);
		case 'renewals-detail':
			return resolveRenewalsDetailPath(route);
		case 'opportunities-list':
			return resolveOpportunitiesListPath(route.meetingKey);
		case 'opportunities-detail':
			return resolveOpportunitiesDetailPath(route);
		case 'since-last-meeting':
			return resolveSinceLastMeetingPath(route.meetingKey);
		case 'since-last-meeting-detail':
			return resolveSinceLastMeetingDetailPath(route);
	}
}

export function parseDashboardRouteFromLayout(input: {
	routeId: string | null;
	params: DashboardLayoutRouteParams;
	searchParams: URLSearchParams;
}): DashboardRouteRef | null {
	if (!input.routeId) {
		return null;
	}

	const definition = dashboardRouteDefinitionEntries.find((entry) =>
		entry.routeIds.includes(input.routeId as never)
	);

	if (!definition) {
		return null;
	}

	return definition.parse({
		routeId: input.routeId,
		params: input.params,
		searchParams: input.searchParams
	});
}

export function isDashboardNavRouteActive(
	itemRoute: DashboardNavRouteRef,
	currentRoute: DashboardRouteRef
) {
	switch (itemRoute.kind) {
		case 'my-accounts-list':
			return currentRoute.kind === 'my-accounts-list' || currentRoute.kind === 'my-accounts-detail';
		case 'new-business-list':
			return (
				currentRoute.kind === 'new-business-list' || currentRoute.kind === 'new-business-detail'
			);
		case 'renewals-list':
			return currentRoute.kind === 'renewals-list' || currentRoute.kind === 'renewals-detail';
		case 'opportunities-list':
			return (
				currentRoute.kind === 'opportunities-list' ||
				currentRoute.kind === 'opportunities-detail'
			);
		case 'since-last-meeting':
			return (
				currentRoute.kind === 'since-last-meeting' ||
				currentRoute.kind === 'since-last-meeting-detail'
			);
	}
}
