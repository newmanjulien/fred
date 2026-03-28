import { buildMyDealsListPageData } from '$lib/dashboard/page-models/myDeals';
import {
	requireDashboardRouteKind
} from '$lib/dashboard/page-models/layout';
import { resolveDefaultBrokerKey } from '$lib/server/brokers';
import { api, createServerConvexClient } from '$lib/server/convex';
import { resolveMyDealsActiveBrokerKey } from '../data/active-broker';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const layoutData = await parent();
	const route = requireDashboardRouteKind(layoutData.route, 'my-deals-list');
	const activeBrokerKey = resolveMyDealsActiveBrokerKey(
		layoutData.dashboardShell.people,
		resolveDefaultBrokerKey()
	);
	const readModel = await createServerConvexClient().query(api.myDeals.getMyDealsList, {
		brokerKey: activeBrokerKey,
		view: route.view
	});

	return buildMyDealsListPageData({ route, readModel, activeBrokerKey });
};
