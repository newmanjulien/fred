import {
	parseDashboardRouteFromLayout,
	resolveDashboardRoute,
	type DashboardRouteRef
} from './index';

type DashboardLayoutParams = {
	view?: string;
	dealKey?: string;
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

function getCanonicalResolution(route: DashboardRouteRef, url: URL): DashboardLayoutRouteResolution {
	const canonicalHref = resolveDashboardRoute(route);
	const currentHref = `${url.pathname}${url.search}`;

	return {
		route,
		redirectTo: currentHref === canonicalHref ? null : canonicalHref
	};
}

export function resolveDashboardLayoutRoute(
	input: DashboardLayoutRouteInput
): DashboardLayoutRouteResolution | null {
	const route = parseDashboardRouteFromLayout({
		routeId: input.routeId,
		params: input.params,
		searchParams: input.url.searchParams
	});

	return route ? getCanonicalResolution(route, input.url) : null;
}
