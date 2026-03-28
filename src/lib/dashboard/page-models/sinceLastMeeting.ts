import { formatIsoDateMonthDayLong } from '$lib/format/date-time';
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
import {
	buildAccountDetailContentPageData,
	type AccountDetailContentPageData
} from './accountDetail';
import {
	createSinceLastMeetingDetailHeader,
	createSinceLastMeetingHeader
} from './headers';

export type SinceLastMeetingAccountPageData = Omit<
	SinceLastMeetingReadModel['accounts'][number],
	'hasDetail'
> & {
	href: ReturnType<typeof resolveSinceLastMeetingDetailPath> | null;
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
}): SinceLastMeetingPageData {
	const { route, readModel } = params;

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

			return {
				...rest,
				href: hasDetail
					? resolveSinceLastMeetingDetailPath({
							accountKey: account.key,
							meetingKey: route.meetingKey
						})
					: null
			};
		}),
		update: readModel.update
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
