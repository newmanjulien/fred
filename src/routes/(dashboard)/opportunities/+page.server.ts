import { redirect } from '@sveltejs/kit';
import { resolveDashboardRoute } from '$lib/dashboard/routing';
import { buildOpportunitiesListPageData } from '$lib/dashboard/page-models/opportunities';
import { requireDashboardRouteKind } from '$lib/dashboard/page-models/layout';
import { resolveSelectedMeetingKey } from '$lib/server/meetings';
import { api, createServerConvexClient } from '$lib/server/convex';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const layoutData = await parent();
	const route = requireDashboardRouteKind(layoutData.route, 'opportunities-list');
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

	const readModel = await createServerConvexClient().query(api.opportunities.getOpportunitiesList, {
		meetingKey
	});

	return buildOpportunitiesListPageData({ route, readModel });
};
