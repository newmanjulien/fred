import { error } from '@sveltejs/kit';
import { buildNewBusinessDetailPageData } from '$lib/dashboard/page-models/newBusiness';
import { requireDashboardRouteKind } from '$lib/dashboard/page-models/layout';
import type { DashboardShellReadModel } from '$lib/dashboard/read-models';
import type { DashboardRouteRef } from '$lib/dashboard/routing';
import { api, createServerConvexClient } from '$lib/server/convex';

type NewBusinessDetailLayoutData = {
	route: DashboardRouteRef;
	dashboardShell: DashboardShellReadModel;
};

export async function loadNewBusinessDetailPageData(
	layoutData: NewBusinessDetailLayoutData
) {
	const route = requireDashboardRouteKind(layoutData.route, 'new-business-detail');
	const readModel = await createServerConvexClient().query(api.newBusiness.getNewBusinessDetail, {
		dealKey: route.dealKey
	});

	if (!readModel) {
		throw error(404, 'Not found');
	}

	return buildNewBusinessDetailPageData({
		route,
		readModel,
		dashboardShell: layoutData.dashboardShell
	});
}
