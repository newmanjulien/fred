import { error, type Actions } from '@sveltejs/kit';
import { applyAccountIndustryUpdate } from '$lib/dashboard/actions/update-industry';
import { buildMyAccountsDetailPageData } from '$lib/dashboard/page-models/myAccounts';
import { requireDashboardRouteKind } from '$lib/dashboard/page-models/layout';
import { resolveDefaultBrokerKey } from '$lib/server/brokers';
import { api, createServerConvexClient } from '$lib/server/convex';
import { resolveMyAccountsActiveBrokerKey } from '../../../data/active-broker';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ parent }) => {
	const layoutData = await parent();
	const route = requireDashboardRouteKind(layoutData.route, 'my-accounts-detail');
	const activeBrokerKey = resolveMyAccountsActiveBrokerKey(
		layoutData.dashboardShell.people,
		resolveDefaultBrokerKey()
	);
	const readModel = await createServerConvexClient().query(api.myAccounts.getMyAccountsDetail, {
		accountKey: route.accountKey,
		brokerKey: activeBrokerKey
	});

	if (!readModel) {
		throw error(404, 'Not found');
	}

	return buildMyAccountsDetailPageData({ route, readModel });
};

export const actions = {
	updateIndustry: ({ request, url }) => applyAccountIndustryUpdate({ request, url })
} satisfies Actions;
