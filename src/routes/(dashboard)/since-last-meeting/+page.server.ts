import { redirect } from '@sveltejs/kit';
import { resolveDashboardRoute } from '$lib/dashboard/routing';
import { buildSinceLastMeetingPageData } from '$lib/dashboard/page-models/sinceLastMeeting';
import { requireDashboardRouteKind } from '$lib/dashboard/page-models/layout';
import { resolveSelectedMeetingKey } from '$lib/server/meetings';
import { api, createServerConvexClient } from '$lib/server/convex';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const layoutData = await parent();
	const route = requireDashboardRouteKind(layoutData.route, 'since-last-meeting');
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

	const readModel = await createServerConvexClient().query(api.sinceLastMeeting.getSinceLastMeeting, {
		meetingKey
	});

	return buildSinceLastMeetingPageData({ route, readModel });
};
