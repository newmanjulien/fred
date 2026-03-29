import { formatIsoDateMonthDayLong } from '$lib/format/date-time';
import type { DashboardLinkTarget } from '$lib/dashboard/links';
import type {
	SinceLastMeetingDetailRouteRef,
	SinceLastMeetingRouteRef
} from '$lib/dashboard/routing';
import { resolveSinceLastMeetingDetailPath } from '$lib/dashboard/routing/since-last-meeting';
import type {
	AccountDetailReadModel,
	DashboardShellReadModel,
	SinceLastMeetingReadModel
} from '$lib/dashboard/read-models';
import type { DashboardHeader } from '$lib/dashboard/shell/header/types';
import { withPreparedDataQuote } from '$lib/dashboard/view-models/detail-builders';
import {
	buildAccountDetailContentPageData,
	type AccountDetailContentPageData
} from './accountDetail';
import {
	createSinceLastMeetingDetailHeader,
	createSinceLastMeetingHeader
} from './headers';

type SinceLastMeetingNavigation = Extract<
	DashboardLinkTarget,
	{ kind: 'since-last-meeting' | 'none' }
>;

function toSinceLastMeetingNavigation(
	route: SinceLastMeetingRouteRef,
	account: SinceLastMeetingReadModel['accounts'][number]
): SinceLastMeetingNavigation {
	if (!account.hasDetail) {
		return {
			kind: 'none'
		};
	}

	return {
		kind: 'since-last-meeting',
		href: resolveSinceLastMeetingDetailPath({
			accountKey: account.key,
			meetingKey: route.meetingKey
		})
	};
}

export type SinceLastMeetingAccountPageData = Omit<
	SinceLastMeetingReadModel['accounts'][number],
	'hasDetail'
> & {
	navigation: SinceLastMeetingNavigation;
};

export type SinceLastMeetingPageData = {
	route: SinceLastMeetingRouteRef;
	header: DashboardHeader;
	hero: {
		title: string;
		description: string;
	};
	referenceMeetingDateIso: SinceLastMeetingReadModel['referenceMeetingDateIso'];
	timelineItems: SinceLastMeetingReadModel['timelineItems'];
	accounts: SinceLastMeetingAccountPageData[];
	update: SinceLastMeetingReadModel['update'];
};

export type SinceLastMeetingDetailPageData = {
	route: SinceLastMeetingDetailRouteRef;
	header: DashboardHeader;
} & AccountDetailContentPageData;

export function buildSinceLastMeetingPageData(params: {
	route: SinceLastMeetingRouteRef;
	readModel: SinceLastMeetingReadModel;
	dashboardShell: DashboardShellReadModel;
}): SinceLastMeetingPageData {
	const { route, readModel, dashboardShell } = params;

	return {
		route,
		header: createSinceLastMeetingHeader(route.meetingKey),
		hero: {
			title: 'Since your last meeting with Julien',
			description:
				`Get a quick overview of what progress Julien has made since your last meeting on ${formatIsoDateMonthDayLong(readModel.referenceMeetingDateIso)}`
		},
		referenceMeetingDateIso: readModel.referenceMeetingDateIso,
		timelineItems: readModel.timelineItems,
		accounts: readModel.accounts.map((account) => {
			const { hasDetail, ...rest } = account;
			void hasDetail;

			return {
				...rest,
				navigation: toSinceLastMeetingNavigation(route, account)
			};
		}),
		update: withPreparedDataQuote(readModel.update, dashboardShell.team, dashboardShell.branding)
	};
}

export function buildSinceLastMeetingDetailPageData(params: {
	route: SinceLastMeetingDetailRouteRef;
	readModel: AccountDetailReadModel;
	dashboardShell: DashboardShellReadModel;
}): SinceLastMeetingDetailPageData {
	const { route, readModel, dashboardShell } = params;

	return {
		route,
		header: createSinceLastMeetingDetailHeader(readModel.title, route.meetingKey),
		...buildAccountDetailContentPageData({
			readModel,
			dashboardShell
		})
	};
}
