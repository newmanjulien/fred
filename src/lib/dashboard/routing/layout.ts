import {
	parseDashboardRouteFromLayout,
	resolveDashboardRoute,
	type DashboardRouteRef
} from './index';

type DashboardLayoutParams = {
	view?: string;
	accountKey?: string;
	insightKey?: string;
};

type DashboardLayoutRouteInput = {
	routeId: string | null;
	params: DashboardLayoutParams;
	url: URL;
};

export type DashboardLayoutRouteResolution = {
	route: DashboardRouteRef;
	redirectTo: string | null;
};

export function resolveDashboardLayoutRoute(
	input: DashboardLayoutRouteInput
): DashboardLayoutRouteResolution | null {
	const route = parseDashboardRouteFromLayout({
		routeId: input.routeId,
		params: input.params,
		searchParams: input.url.searchParams
	});

	if (!route) {
		return null;
	}

	const canonicalHref = resolveDashboardRoute(route);
	const currentHref = `${input.url.pathname}${input.url.search}`;

	return {
		route,
		redirectTo: currentHref === canonicalHref ? null : canonicalHref
	};
}
