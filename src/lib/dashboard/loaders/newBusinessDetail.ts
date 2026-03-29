import { buildNewBusinessDetailPageData } from '$lib/dashboard/page-models/newBusiness';
import {
	loadDashboardAccountDetailPageData,
	type DashboardAccountDetailLayoutData
} from '$lib/dashboard/loaders/accountDetail';
import { api, createServerConvexClient } from '$lib/server/convex';
import type { AccountDetailReadModel } from '$lib/dashboard/read-models';

export async function loadNewBusinessDetailPageData(layoutData: DashboardAccountDetailLayoutData) {
	return loadDashboardAccountDetailPageData<
		'new-business-detail',
		AccountDetailReadModel,
		ReturnType<typeof buildNewBusinessDetailPageData>
	>({
		layoutData,
		kind: 'new-business-detail',
		loadReadModel: (accountKey) =>
			createServerConvexClient().query(api.newBusiness.getNewBusinessDetail, {
				accountKey
			}),
		buildPageData: ({ route, readModel, dashboardShell }) =>
			buildNewBusinessDetailPageData({
				route,
				readModel,
				dashboardShell
			})
	});
}
