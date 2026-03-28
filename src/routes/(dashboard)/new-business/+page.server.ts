import { buildNewBusinessListPageData } from '$lib/dashboard/page-models/newBusiness';
import { requireDashboardRouteKind } from '$lib/dashboard/page-models/layout';
import { api, createServerConvexClient } from '$lib/server/convex';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const layoutData = await parent();
	const route = requireDashboardRouteKind(layoutData.route, 'new-business-list');
	const readModel = await createServerConvexClient().query(api.newBusiness.getNewBusinessList, {
		view: route.view
	});

	return buildNewBusinessListPageData({ route, readModel });
};
