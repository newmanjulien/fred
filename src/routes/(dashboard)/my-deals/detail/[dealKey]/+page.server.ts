import { error, type Actions } from '@sveltejs/kit';
import { applyDealIndustryUpdate } from '$lib/dashboard/actions/update-industry';
import { buildMyDealsDetailPageData } from '$lib/dashboard/page-models/myDeals';
import { requireDashboardRouteKind } from '$lib/dashboard/page-models/layout';
import { resolveDefaultBrokerKey } from '$lib/server/brokers';
import { api, createServerConvexClient } from '$lib/server/convex';
import { resolveMyDealsActiveBrokerKey } from '../../data/active-broker';
import type { PageServerLoad } from './$types';

export const prerender = false;

export const load: PageServerLoad = async ({ parent }) => {
	const layoutData = await parent();
	const route = requireDashboardRouteKind(layoutData.route, 'my-deals-detail');
	const activeBrokerKey = resolveMyDealsActiveBrokerKey(
		layoutData.dashboardShell.people,
		resolveDefaultBrokerKey()
	);
	const readModel = await createServerConvexClient().query(api.myDeals.getMyDealsDetail, {
		dealKey: route.dealKey,
		brokerKey: activeBrokerKey,
		view: route.view
	});

	if (!readModel) {
		throw error(404, 'Not found');
	}

	return buildMyDealsDetailPageData({ route, readModel });
};

export const actions = {
	updateIndustry: ({ request, url }) => applyDealIndustryUpdate({ request, url })
} satisfies Actions;
