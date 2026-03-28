import { error, redirect } from '@sveltejs/kit';
import { resolveDashboardLayoutRoute } from '$lib/dashboard/routing/layout';
import { resolveDefaultBrokerKey } from '$lib/server/brokers';
import { api, createServerConvexClient } from '$lib/server/convex';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ route, params, url }) => {
	const routeState = resolveDashboardLayoutRoute({
		routeId: route.id,
		params,
		url
	});

	if (!routeState) {
		throw error(404, 'Not found');
	}

	if (routeState.redirectTo) {
		throw redirect(308, routeState.redirectTo);
	}

	const dashboardShell = await createServerConvexClient().query(api.shell.getDashboardShell);
	const defaultBrokerKey = resolveDefaultBrokerKey();
	const defaultBroker = dashboardShell.people.find((person) => person.key === defaultBrokerKey);

	if (!defaultBroker) {
		throw error(500, `Unknown default broker key "${defaultBrokerKey}".`);
	}

	return {
		route: routeState.route,
		dashboardShell,
		defaultBroker
	};
};
