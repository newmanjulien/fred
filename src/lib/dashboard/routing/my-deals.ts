import type { DealKey } from '$lib/types/keys';

const MY_DEALS_BASE_PATH = '/my-deals';

export const DEFAULT_MY_DEALS_VIEW = 'news' as const;
export const MY_DEALS_NON_DEFAULT_VIEWS = ['deals'] as const;

export type NonDefaultMyDealsView = (typeof MY_DEALS_NON_DEFAULT_VIEWS)[number];
export type MyDealsView = typeof DEFAULT_MY_DEALS_VIEW | NonDefaultMyDealsView;

export const MY_DEALS_VIEW_OPTIONS = [
	{ id: DEFAULT_MY_DEALS_VIEW, label: "This week's news" },
	{ id: 'deals', label: 'Deals' }
] as const;

export const DEFAULT_MY_DEALS_DETAIL_TAB_ID = 'news' as const;
export const MY_DEALS_DETAIL_TAB_IDS = [
	DEFAULT_MY_DEALS_DETAIL_TAB_ID,
	'activity',
	'update'
] as const;

export type MyDealsDetailTabId = (typeof MY_DEALS_DETAIL_TAB_IDS)[number];
type NonDefaultMyDealsDetailTabId = Exclude<
	MyDealsDetailTabId,
	typeof DEFAULT_MY_DEALS_DETAIL_TAB_ID
>;

export type MyDealsListPath = '/my-deals' | `/my-deals/${NonDefaultMyDealsView}`;
export type MyDealsDetailPath =
	| `/my-deals/detail/${DealKey}`
	| `/my-deals/detail/${DealKey}?tab=${NonDefaultMyDealsDetailTabId}`
	| `/my-deals/${NonDefaultMyDealsView}/detail/${DealKey}`
	| `/my-deals/${NonDefaultMyDealsView}/detail/${DealKey}?tab=${NonDefaultMyDealsDetailTabId}`;

export function isNonDefaultMyDealsView(value: string): value is NonDefaultMyDealsView {
	return MY_DEALS_NON_DEFAULT_VIEWS.includes(value as NonDefaultMyDealsView);
}

export function getMyDealsViewLabel(view: MyDealsView) {
	return (
		MY_DEALS_VIEW_OPTIONS.find((option) => option.id === view)?.label ?? MY_DEALS_VIEW_OPTIONS[0].label
	);
}

export function isMyDealsDetailTabId(value: string): value is MyDealsDetailTabId {
	return MY_DEALS_DETAIL_TAB_IDS.includes(value as MyDealsDetailTabId);
}

export function resolveMyDealsDetailTabId(value: string | null): MyDealsDetailTabId {
	return value && isMyDealsDetailTabId(value) ? value : DEFAULT_MY_DEALS_DETAIL_TAB_ID;
}

export function resolveMyDealsListPath(view: MyDealsView): MyDealsListPath {
	if (view === DEFAULT_MY_DEALS_VIEW) {
		return MY_DEALS_BASE_PATH;
	}

	return `${MY_DEALS_BASE_PATH}/${view}` as MyDealsListPath;
}

export function resolveMyDealsDetailPath(params: {
	dealKey: DealKey;
	view: MyDealsView;
	tab: MyDealsDetailTabId;
}): MyDealsDetailPath {
	const listPath = resolveMyDealsListPath(params.view);
	const detailPath =
		params.view === DEFAULT_MY_DEALS_VIEW
			? `${MY_DEALS_BASE_PATH}/detail/${params.dealKey}`
			: `${listPath}/detail/${params.dealKey}`;

	if (params.tab === DEFAULT_MY_DEALS_DETAIL_TAB_ID) {
		return detailPath as MyDealsDetailPath;
	}

	return `${detailPath}?tab=${params.tab}` as MyDealsDetailPath;
}
