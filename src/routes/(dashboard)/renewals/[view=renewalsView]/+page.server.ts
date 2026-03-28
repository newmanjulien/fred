import { buildRenewalsListPageData } from '$lib/dashboard/page-models/renewals';
import { requireDashboardRouteKind } from '$lib/dashboard/page-models/layout';
import { api, createServerConvexClient } from '$lib/server/convex';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const layoutData = await parent();
	const route = requireDashboardRouteKind(layoutData.route, 'renewals-list');
	const readModel = await createServerConvexClient().query(api.renewals.getRenewalsList, {
		view: route.view
	});

	return buildRenewalsListPageData({ route, readModel });
};
