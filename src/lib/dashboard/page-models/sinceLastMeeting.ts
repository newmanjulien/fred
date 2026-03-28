import { formatIsoDateMonthDayLong } from '$lib/format/date-time';
import type {
	SinceLastMeetingDetailRouteRef,
	SinceLastMeetingRouteRef
} from '$lib/dashboard/routing';
import { resolveSinceLastMeetingDetailPath } from '$lib/dashboard/routing/since-last-meeting';
import type {
	DashboardShellReadModel,
	SinceLastMeetingDetailReadModel,
	SinceLastMeetingReadModel
} from '$lib/dashboard/read-models';
import type { DashboardHeader } from '$lib/dashboard/shell/header/types';
import {
	buildDealDetailContentPageData,
	type DealDetailContentPageData
} from './dealDetail';
import {
	createSinceLastMeetingDetailHeader,
	createSinceLastMeetingHeader
} from './headers';

export type SinceLastMeetingDealPageData = Omit<
	SinceLastMeetingReadModel['deals'][number],
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
	deals: SinceLastMeetingDealPageData[];
	update: SinceLastMeetingReadModel['update'];
};

export type SinceLastMeetingDetailPageData = {
	route: SinceLastMeetingDetailRouteRef;
	header: DashboardHeader;
} & DealDetailContentPageData;

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
		deals: readModel.deals.map((deal) => {
			const { hasDetail, ...rest } = deal;

			return {
				...rest,
				href: hasDetail
					? resolveSinceLastMeetingDetailPath({
							dealKey: deal.key,
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
	readModel: SinceLastMeetingDetailReadModel;
	dashboardShell: DashboardShellReadModel;
}): SinceLastMeetingDetailPageData {
	const { route, readModel, dashboardShell } = params;

	return {
		route,
		header: createSinceLastMeetingDetailHeader(readModel.title, route.meetingKey),
		...buildDealDetailContentPageData({
			readModel,
			dashboardShell
		})
	};
}
