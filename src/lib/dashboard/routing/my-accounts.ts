import type { AccountKey } from '$lib/types/keys';

const MY_ACCOUNTS_BASE_PATH = '/my-accounts';

export const DEFAULT_MY_ACCOUNTS_VIEW = 'news' as const;
export const MY_ACCOUNTS_NON_DEFAULT_VIEWS = ['accounts'] as const;

export type NonDefaultMyAccountsView = (typeof MY_ACCOUNTS_NON_DEFAULT_VIEWS)[number];
export type MyAccountsView = typeof DEFAULT_MY_ACCOUNTS_VIEW | NonDefaultMyAccountsView;

export const MY_ACCOUNTS_VIEW_OPTIONS = [
	{ id: DEFAULT_MY_ACCOUNTS_VIEW, label: "This week's news" },
	{ id: 'accounts', label: 'Accounts' }
] as const;

export const DEFAULT_MY_ACCOUNTS_DETAIL_TAB_ID = 'news' as const;
export const MY_ACCOUNTS_DETAIL_TAB_IDS = [
	DEFAULT_MY_ACCOUNTS_DETAIL_TAB_ID,
	'activity',
	'update'
] as const;

export type MyAccountsDetailTabId = (typeof MY_ACCOUNTS_DETAIL_TAB_IDS)[number];
type NonDefaultMyAccountsDetailTabId = Exclude<
	MyAccountsDetailTabId,
	typeof DEFAULT_MY_ACCOUNTS_DETAIL_TAB_ID
>;

export type MyAccountsListPath = '/my-accounts' | `/my-accounts/${NonDefaultMyAccountsView}`;
export type MyAccountsDetailPath =
	| `/my-accounts/detail/${AccountKey}`
	| `/my-accounts/detail/${AccountKey}?tab=${NonDefaultMyAccountsDetailTabId}`
	| `/my-accounts/${NonDefaultMyAccountsView}/detail/${AccountKey}`
	| `/my-accounts/${NonDefaultMyAccountsView}/detail/${AccountKey}?tab=${NonDefaultMyAccountsDetailTabId}`;

export function isNonDefaultMyAccountsView(value: string): value is NonDefaultMyAccountsView {
	return MY_ACCOUNTS_NON_DEFAULT_VIEWS.includes(value as NonDefaultMyAccountsView);
}

export function getMyAccountsViewLabel(view: MyAccountsView) {
	return (
		MY_ACCOUNTS_VIEW_OPTIONS.find((option) => option.id === view)?.label ?? MY_ACCOUNTS_VIEW_OPTIONS[0].label
	);
}

export function isMyAccountsDetailTabId(value: string): value is MyAccountsDetailTabId {
	return MY_ACCOUNTS_DETAIL_TAB_IDS.includes(value as MyAccountsDetailTabId);
}

export function resolveMyAccountsDetailTabId(value: string | null): MyAccountsDetailTabId {
	return value && isMyAccountsDetailTabId(value) ? value : DEFAULT_MY_ACCOUNTS_DETAIL_TAB_ID;
}

export function resolveMyAccountsListPath(view: MyAccountsView): MyAccountsListPath {
	if (view === DEFAULT_MY_ACCOUNTS_VIEW) {
		return MY_ACCOUNTS_BASE_PATH;
	}

	return `${MY_ACCOUNTS_BASE_PATH}/${view}` as MyAccountsListPath;
}

export function resolveMyAccountsDetailPath(params: {
	accountKey: AccountKey;
	view: MyAccountsView;
	tab: MyAccountsDetailTabId;
}): MyAccountsDetailPath {
	const listPath = resolveMyAccountsListPath(params.view);
	const detailPath =
		params.view === DEFAULT_MY_ACCOUNTS_VIEW
			? `${MY_ACCOUNTS_BASE_PATH}/detail/${params.accountKey}`
			: `${listPath}/detail/${params.accountKey}`;

	if (params.tab === DEFAULT_MY_ACCOUNTS_DETAIL_TAB_ID) {
		return detailPath as MyAccountsDetailPath;
	}

	return `${detailPath}?tab=${params.tab}` as MyAccountsDetailPath;
}
