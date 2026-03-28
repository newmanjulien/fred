import { error, redirect, type Actions } from '@sveltejs/kit';
import { applyDealIndustryUpdate } from '$lib/dashboard/actions/update-industry';
import { buildSinceLastMeetingDetailPageData } from '$lib/dashboard/page-models/sinceLastMeeting';
import { requireDashboardRouteKind } from '$lib/dashboard/page-models/layout';
import { resolveDashboardRoute } from '$lib/dashboard/routing';
import { api, createServerConvexClient } from '$lib/server/convex';
import { resolveSelectedMeetingKey } from '$lib/server/meetings';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ parent }) => {
	const layoutData = await parent();
	const route = requireDashboardRouteKind(layoutData.route, 'since-last-meeting-detail');
	const meetingKey = resolveSelectedMeetingKey(layoutData.dashboardShell, route.meetingKey);

	if (route.meetingKey !== meetingKey) {
		throw redirect(
			308,
			resolveDashboardRoute({
				...route,
				meetingKey
			})
		);
	}

	const readModel = await createServerConvexClient().query(
		api.sinceLastMeeting.getSinceLastMeetingDetail,
		{
			meetingKey,
			dealKey: route.dealKey
		}
	);

	if (!readModel) {
		throw error(404, 'Not found');
	}

	return buildSinceLastMeetingDetailPageData({
		route,
		readModel,
		dashboardShell: layoutData.dashboardShell
	});
};

export const actions = {
	updateIndustry: ({ request, url }) => applyDealIndustryUpdate({ request, url })
} satisfies Actions;
