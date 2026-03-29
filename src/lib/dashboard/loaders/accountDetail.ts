import { error } from '@sveltejs/kit';
import type { DashboardShellReadModel } from '$lib/dashboard/read-models';
import type { DashboardRouteRef } from '$lib/dashboard/routing';
import type { AccountKey } from '$lib/types/keys';

export type DashboardAccountDetailLayoutData = {
	route: DashboardRouteRef;
	dashboardShell: DashboardShellReadModel;
};

type DashboardAccountDetailRouteRef = Extract<
	DashboardRouteRef,
	{ accountKey: AccountKey }
>;

type DashboardAccountDetailRouteKind = DashboardAccountDetailRouteRef['kind'];

function isDashboardAccountDetailRoute<TRouteKind extends DashboardAccountDetailRouteKind>(
	route: DashboardRouteRef,
	kind: TRouteKind
): route is Extract<DashboardAccountDetailRouteRef, { kind: TRouteKind }> {
	return route.kind === kind && 'accountKey' in route;
}

export async function loadDashboardAccountDetailPageData<
	TRouteKind extends DashboardAccountDetailRouteKind,
	TReadModel,
	TPageData
>(params: {
	layoutData: DashboardAccountDetailLayoutData;
	kind: TRouteKind;
	loadReadModel: (accountKey: AccountKey) => Promise<TReadModel | null>;
	buildPageData: (input: {
		route: Extract<DashboardRouteRef, { kind: TRouteKind }>;
		readModel: TReadModel;
		dashboardShell: DashboardShellReadModel;
	}) => TPageData;
}): Promise<TPageData> {
	if (!isDashboardAccountDetailRoute(params.layoutData.route, params.kind)) {
		throw error(500, 'Unexpected dashboard route state.');
	}

	const route = params.layoutData.route;
	const readModel = await params.loadReadModel(route.accountKey);

	if (!readModel) {
		throw error(404, 'Not found');
	}

	return params.buildPageData({
		route,
		readModel,
		dashboardShell: params.layoutData.dashboardShell
	});
}
