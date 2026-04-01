import { buildRenewalsDetailPageData } from '$lib/dashboard/page-models/renewals';
import {
	loadDashboardAccountDetailPageData,
	type DashboardAccountDetailLayoutData
} from '$lib/dashboard/loaders/accountDetail';
import { api, createServerConvexClient } from '$lib/server/convex';
import type { RenewalsDetailReadModel } from '$lib/dashboard/read-models';

export async function loadRenewalsDetailPageData(layoutData: DashboardAccountDetailLayoutData) {
	return loadDashboardAccountDetailPageData<
		'renewals-detail',
		RenewalsDetailReadModel,
		ReturnType<typeof buildRenewalsDetailPageData>
	>({
		layoutData,
		kind: 'renewals-detail',
		loadReadModel: (accountKey) =>
			createServerConvexClient().query(api.renewals.getRenewalsDetail, {
				accountKey
			}),
		buildPageData: ({ route, readModel, dashboardShell }) =>
			buildRenewalsDetailPageData({
				route,
				readModel,
				dashboardShell
			})
	});
}
