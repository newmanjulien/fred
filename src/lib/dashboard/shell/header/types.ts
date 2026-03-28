import type { MeetingKey } from '$lib/types/keys';
import type { MyDealsView } from '$lib/dashboard/routing/my-deals';
import type { NewBusinessView } from '$lib/dashboard/routing/new-business';
import type { RenewalsView } from '$lib/dashboard/routing/renewals';

export type DashboardHeaderMeetingDateControl = {
	kind: 'meeting-date';
	pageKind: 'opportunities' | 'since-last-meeting';
	meetingKey: MeetingKey | null;
};

export type DashboardHeaderBackLinkControl =
	| {
			kind: 'my-deals-back-link';
			view: MyDealsView;
			label: string;
	  }
	| {
			kind: 'new-business-back-link';
			view: NewBusinessView;
			label: string;
	  }
	| {
			kind: 'renewals-back-link';
			view: RenewalsView;
			label: string;
	  }
	| {
			kind: 'opportunities-back-link';
			meetingKey: MeetingKey | null;
			label: string;
	  }
	| {
			kind: 'since-last-meeting-back-link';
			meetingKey: MeetingKey | null;
			label: string;
	  };

export type DashboardHeaderControl =
	| DashboardHeaderMeetingDateControl
	| DashboardHeaderBackLinkControl;

export type DashboardHeaderAction = 'share' | 'broker-switch';

export type MyDealsHeaderTitleMenu = {
	kind: 'link-menu';
	pageKind: 'my-deals';
	menuId: string;
	ariaLabel: string;
	sectionLabel: string;
	activeLabel: string;
	options: {
		id: MyDealsView;
		label: string;
		current: boolean;
	}[];
};

export type NewBusinessHeaderTitleMenu = {
	kind: 'link-menu';
	pageKind: 'new-business';
	menuId: string;
	ariaLabel: string;
	sectionLabel: string;
	activeLabel: string;
	options: {
		id: NewBusinessView;
		label: string;
		current: boolean;
	}[];
};

export type RenewalsHeaderTitleMenu = {
	kind: 'link-menu';
	pageKind: 'renewals';
	menuId: string;
	ariaLabel: string;
	sectionLabel: string;
	activeLabel: string;
	options: {
		id: RenewalsView;
		label: string;
		current: boolean;
	}[];
};

export type DashboardHeaderTitleMenu =
	| MyDealsHeaderTitleMenu
	| NewBusinessHeaderTitleMenu
	| RenewalsHeaderTitleMenu;

export type DashboardHeaderLeading =
	| {
			kind: 'title';
			title: string;
	  }
	| {
			kind: 'title-menu';
			title: string;
			menu: DashboardHeaderTitleMenu;
	  }
	| {
			kind: 'control-title';
			control: DashboardHeaderControl;
			title: string;
	  };

export type DashboardHeader = {
	leading: DashboardHeaderLeading;
	actions?: DashboardHeaderAction[];
};
