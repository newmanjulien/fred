import type { DashboardHeader } from '$lib/dashboard/shell/header/types';
import { buildHeaderTitleMenuOptions } from '$lib/dashboard/shell/header/title-menu';
import type { MeetingKey } from '$lib/types/keys';
import {
	MY_ACCOUNTS_VIEW_OPTIONS,
	getMyAccountsViewLabel,
	type MyAccountsView
} from '$lib/dashboard/routing/my-accounts';
import {
	NEW_BUSINESS_VIEW_OPTIONS,
	getNewBusinessViewLabel,
	type NewBusinessView
} from '$lib/dashboard/routing/new-business';
import {
	RENEWALS_VIEW_OPTIONS,
	getRenewalsViewLabel,
	type RenewalsView
} from '$lib/dashboard/routing/renewals';

export function createSinceLastMeetingHeader(meetingKey: MeetingKey | null): DashboardHeader {
	return {
		leading: {
			kind: 'control-title',
			title: 'Since last meeting',
			control: {
				kind: 'meeting-date',
				pageKind: 'since-last-meeting',
				meetingKey
			}
		},
		actions: ['share', 'broker-switch']
	};
}

export function createSinceLastMeetingDetailHeader(
	title: string,
	meetingKey: MeetingKey | null
): DashboardHeader {
	return {
		leading: {
			kind: 'control-title',
			title,
			control: {
				kind: 'since-last-meeting-back-link',
				meetingKey,
				label: 'Since last meeting'
			}
		},
		actions: ['share', 'broker-switch']
	};
}

export function createOpportunitiesListHeader(meetingKey: MeetingKey | null): DashboardHeader {
	return {
		leading: {
			kind: 'control-title',
			title: 'Opportunities & risks',
			control: {
				kind: 'meeting-date',
				pageKind: 'opportunities',
				meetingKey
			}
		},
		actions: ['share', 'broker-switch']
	};
}

export function createOpportunitiesDetailHeader(
	title: string,
	meetingKey: MeetingKey | null
): DashboardHeader {
	return {
		leading: {
			kind: 'control-title',
			title,
			control: {
				kind: 'opportunities-back-link',
				meetingKey,
				label: 'Opportunities & risks'
			}
		},
		actions: ['share', 'broker-switch']
	};
}

export function createMyAccountsListHeader(selectedView: MyAccountsView): DashboardHeader {
	return {
		leading: {
			kind: 'title-menu',
			title: 'My accounts',
			menu: {
				kind: 'link-menu',
				pageKind: 'my-accounts',
				menuId: 'desktop-my-accounts-view',
				ariaLabel: 'Change my accounts view',
				sectionLabel: 'Select view',
				activeLabel: getMyAccountsViewLabel(selectedView),
				options: buildHeaderTitleMenuOptions({
					selectedId: selectedView,
					options: MY_ACCOUNTS_VIEW_OPTIONS
				})
			}
		},
		actions: ['share']
	};
}

export function createMyAccountsDetailHeader(
	title: string,
	selectedView: MyAccountsView
): DashboardHeader {
	return {
		leading: {
			kind: 'control-title',
			title,
			control: {
				kind: 'my-accounts-back-link',
				view: selectedView,
				label: getMyAccountsViewLabel(selectedView)
			}
		},
		actions: ['share']
	};
}

export function createNewBusinessListHeader(selectedView: NewBusinessView): DashboardHeader {
	return {
		leading: {
			kind: 'title-menu',
			title: 'New business',
			menu: {
				kind: 'link-menu',
				pageKind: 'new-business',
				menuId: 'desktop-new-business-view',
				ariaLabel: 'Change new business view',
				sectionLabel: 'Select new business view',
				activeLabel: getNewBusinessViewLabel(selectedView),
				options: buildHeaderTitleMenuOptions({
					selectedId: selectedView,
					options: NEW_BUSINESS_VIEW_OPTIONS
				})
			}
		},
		actions: ['share']
	};
}

export function createNewBusinessDetailHeader(
	title: string,
	selectedView: NewBusinessView
): DashboardHeader {
	return {
		leading: {
			kind: 'control-title',
			title,
			control: {
				kind: 'new-business-back-link',
				view: selectedView,
				label: getNewBusinessViewLabel(selectedView)
			}
		},
		actions: ['share']
	};
}

export function createRenewalsListHeader(selectedView: RenewalsView): DashboardHeader {
	return {
		leading: {
			kind: 'title-menu',
			title: 'Renewals',
			menu: {
				kind: 'link-menu',
				pageKind: 'renewals',
				menuId: 'desktop-renewals-view',
				ariaLabel: 'Change renewals view',
				sectionLabel: 'Select renewals view',
				activeLabel: getRenewalsViewLabel(selectedView),
				options: buildHeaderTitleMenuOptions({
					selectedId: selectedView,
					options: RENEWALS_VIEW_OPTIONS
				})
			}
		},
		actions: ['share']
	};
}

export function createRenewalsDetailHeader(
	title: string,
	selectedView: RenewalsView
): DashboardHeader {
	return {
		leading: {
			kind: 'control-title',
			title,
			control: {
				kind: 'renewals-back-link',
				view: selectedView,
				label: getRenewalsViewLabel(selectedView)
			}
		},
		actions: ['share']
	};
}
