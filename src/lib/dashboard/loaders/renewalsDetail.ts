import { error } from '@sveltejs/kit';
import { buildRenewalsDetailPageData } from '$lib/dashboard/page-models/renewals';
import { requireDashboardRouteKind } from '$lib/dashboard/page-models/layout';
import type { DashboardShellReadModel } from '$lib/dashboard/read-models';
import type { DashboardRouteRef } from '$lib/dashboard/routing';
import { api, createServerConvexClient } from '$lib/server/convex';

type RenewalsDetailLayoutData = {
	route: DashboardRouteRef;
	dashboardShell: DashboardShellReadModel;
};

export async function loadRenewalsDetailPageData(layoutData: RenewalsDetailLayoutData) {
	const route = requireDashboardRouteKind(layoutData.route, 'renewals-detail');
	const readModel = await createServerConvexClient().query(api.renewals.getRenewalsDetail, {
		dealKey: route.dealKey
	});

	if (!readModel) {
		throw error(404, 'Not found');
	}

	return buildRenewalsDetailPageData({
		route,
		readModel,
		dashboardShell: layoutData.dashboardShell
	});
}
