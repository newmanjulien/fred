import { error, redirect, type Actions } from '@sveltejs/kit';
import { applyDealIndustryUpdate } from '$lib/dashboard/actions/update-industry';
import { resolveDashboardRoute } from '$lib/dashboard/routing';
import { buildOpportunityDetailPageData } from '$lib/dashboard/page-models/opportunities';
import { requireDashboardRouteKind } from '$lib/dashboard/page-models/layout';
import { resolveSelectedMeetingKey } from '$lib/server/meetings';
import { api, createServerConvexClient } from '$lib/server/convex';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ parent }) => {
	const layoutData = await parent();
	const route = requireDashboardRouteKind(layoutData.route, 'opportunities-detail');
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

	const readModel = await createServerConvexClient().query(api.opportunities.getOpportunityDetail, {
		insightKey: route.insightKey,
		meetingKey
	});

	if (!readModel) {
		throw error(404, 'Not found');
	}

	return buildOpportunityDetailPageData({
		route,
		readModel,
		dashboardShell: layoutData.dashboardShell
	});
};

export const actions = {
	updateIndustry: ({ request, url }) => applyDealIndustryUpdate({ request, url })
} satisfies Actions;
