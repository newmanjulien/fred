import type { AccountKey } from '$lib/types/keys';

const RENEWALS_BASE_PATH = '/renewals';

export const DEFAULT_RENEWALS_VIEW = 'accounts' as const;
export const RENEWALS_NON_DEFAULT_VIEWS = ['at-risk', 'likely-out-of-date'] as const;

export type NonDefaultRenewalsView = (typeof RENEWALS_NON_DEFAULT_VIEWS)[number];
export type RenewalsView = typeof DEFAULT_RENEWALS_VIEW | NonDefaultRenewalsView;
export type RenewalsListPath = '/renewals' | `/renewals/${NonDefaultRenewalsView}`;
export type RenewalsDetailPath =
	| `/renewals/detail/${AccountKey}`
	| `/renewals/${NonDefaultRenewalsView}/detail/${AccountKey}`;

export const RENEWALS_VIEW_OPTIONS = [
	{ id: DEFAULT_RENEWALS_VIEW, label: 'Accounts' },
	{ id: 'at-risk', label: 'At risk' },
	{ id: 'likely-out-of-date', label: 'Likely out of date' }
] as const;

export function isNonDefaultRenewalsView(value: string): value is NonDefaultRenewalsView {
	return RENEWALS_NON_DEFAULT_VIEWS.includes(value as NonDefaultRenewalsView);
}

export function getRenewalsViewLabel(view: RenewalsView) {
	return (
		RENEWALS_VIEW_OPTIONS.find((option) => option.id === view)?.label ??
		RENEWALS_VIEW_OPTIONS[0].label
	);
}

export function resolveRenewalsListPath(view: RenewalsView): RenewalsListPath {
	if (view === DEFAULT_RENEWALS_VIEW) {
		return RENEWALS_BASE_PATH;
	}

	return `${RENEWALS_BASE_PATH}/${view}` as RenewalsListPath;
}

export function resolveRenewalsDetailPath(params: {
	accountKey: AccountKey;
	view: RenewalsView;
}): RenewalsDetailPath {
	return `${resolveRenewalsListPath(params.view)}/detail/${params.accountKey}` as RenewalsDetailPath;
}
