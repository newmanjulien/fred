import { error } from '@sveltejs/kit';
import type { DashboardRouteRef } from '$lib/dashboard/routing';
import type { DashboardShellReadModel } from '$lib/dashboard/read-models';

export type DashboardLayoutData = {
	route: DashboardRouteRef;
	dashboardShell: DashboardShellReadModel;
};

export function requireDashboardRouteKind<TRouteKind extends DashboardRouteRef['kind']>(
	route: DashboardLayoutData['route'],
	kind: TRouteKind
): Extract<DashboardRouteRef, { kind: TRouteKind }> {
	if (route.kind !== kind) {
		throw error(500, 'Unexpected dashboard route state.');
	}

	return route as Extract<DashboardRouteRef, { kind: TRouteKind }>;
}
