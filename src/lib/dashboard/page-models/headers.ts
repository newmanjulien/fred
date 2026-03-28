import type { DashboardHeader } from '$lib/dashboard/shell/header/types';
import { buildHeaderTitleMenuOptions } from '$lib/dashboard/shell/header/title-menu';
import type { MeetingKey } from '$lib/types/keys';
import {
	MY_DEALS_VIEW_OPTIONS,
	getMyDealsViewLabel,
	type MyDealsView
} from '$lib/dashboard/routing/my-deals';
import {
	NEW_BUSINESS_VIEW_OPTIONS,
	getNewBusinessViewLabel,
	type NewBusinessView
} from '$lib/dashboard/routing/new-business';

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

export function createMyDealsListHeader(selectedView: MyDealsView): DashboardHeader {
	return {
		leading: {
			kind: 'title-menu',
			title: 'My deals',
			menu: {
				kind: 'link-menu',
				pageKind: 'my-deals',
				menuId: 'desktop-my-deals-view',
				ariaLabel: 'Change my deals view',
				sectionLabel: 'Select view',
				activeLabel: getMyDealsViewLabel(selectedView),
				options: buildHeaderTitleMenuOptions({
					selectedId: selectedView,
					options: MY_DEALS_VIEW_OPTIONS
				})
			}
		},
		actions: ['share']
	};
}

export function createMyDealsDetailHeader(
	title: string,
	selectedView: MyDealsView
): DashboardHeader {
	return {
		leading: {
			kind: 'control-title',
			title,
			control: {
				kind: 'my-deals-back-link',
				view: selectedView,
				label: getMyDealsViewLabel(selectedView)
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
