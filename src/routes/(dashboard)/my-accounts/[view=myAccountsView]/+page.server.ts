import { buildMyAccountsListPageData } from '$lib/dashboard/page-models/myAccounts';
import {
	requireDashboardRouteKind
} from '$lib/dashboard/page-models/layout';
import { resolveDefaultBrokerKey } from '$lib/server/brokers';
import { api, createServerConvexClient } from '$lib/server/convex';
import { resolveMyAccountsActiveBrokerKey } from '../data/active-broker';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const layoutData = await parent();
	const route = requireDashboardRouteKind(layoutData.route, 'my-accounts-list');
	const activeBrokerKey = resolveMyAccountsActiveBrokerKey(
		layoutData.dashboardShell.people,
		resolveDefaultBrokerKey()
	);
	const readModel = await createServerConvexClient().query(api.myAccounts.getMyAccountsList, {
		brokerKey: activeBrokerKey,
		view: route.view
	});

	return buildMyAccountsListPageData({ route, readModel, activeBrokerKey });
};
