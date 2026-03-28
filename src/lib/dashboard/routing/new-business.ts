import type { DealKey } from '$lib/types/keys';

const NEW_BUSINESS_BASE_PATH = '/new-business';

export const DEFAULT_NEW_BUSINESS_VIEW = 'deals' as const;
export const NEW_BUSINESS_NON_DEFAULT_VIEWS = [
	'need-support',
	'duplicated-work',
	'unassigned',
	'likely-out-of-date'
] as const;

export type NonDefaultNewBusinessView = (typeof NEW_BUSINESS_NON_DEFAULT_VIEWS)[number];
export type NewBusinessView = typeof DEFAULT_NEW_BUSINESS_VIEW | NonDefaultNewBusinessView;
export type NewBusinessListPath = '/new-business' | `/new-business/${NonDefaultNewBusinessView}`;
export type NewBusinessDetailPath =
	| `/new-business/detail/${DealKey}`
	| `/new-business/${NonDefaultNewBusinessView}/detail/${DealKey}`;

export const NEW_BUSINESS_VIEW_OPTIONS = [
	{ id: DEFAULT_NEW_BUSINESS_VIEW, label: 'Deals' },
	{ id: 'need-support', label: 'Need support' },
	{ id: 'duplicated-work', label: 'Duplicated work' },
	{ id: 'unassigned', label: 'Unassigned' },
	{ id: 'likely-out-of-date', label: 'Likely out of date' }
] as const;

export function isNonDefaultNewBusinessView(value: string): value is NonDefaultNewBusinessView {
	return NEW_BUSINESS_NON_DEFAULT_VIEWS.includes(value as NonDefaultNewBusinessView);
}

export function getNewBusinessViewLabel(view: NewBusinessView) {
	return (
		NEW_BUSINESS_VIEW_OPTIONS.find((option) => option.id === view)?.label ??
		NEW_BUSINESS_VIEW_OPTIONS[0].label
	);
}

export function resolveNewBusinessListPath(view: NewBusinessView): NewBusinessListPath {
	if (view === DEFAULT_NEW_BUSINESS_VIEW) {
		return NEW_BUSINESS_BASE_PATH;
	}

	return `${NEW_BUSINESS_BASE_PATH}/${view}` as NewBusinessListPath;
}

export function resolveNewBusinessDetailPath(params: {
	dealKey: DealKey;
	view: NewBusinessView;
}): NewBusinessDetailPath {
	return `${resolveNewBusinessListPath(params.view)}/detail/${params.dealKey}` as NewBusinessDetailPath;
}
