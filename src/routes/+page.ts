import { redirect } from '@sveltejs/kit';
import {
	DEFAULT_DASHBOARD_ROUTE_REF,
	resolveDashboardRoute
} from '$lib/dashboard/routing';

export const load = () => {
	throw redirect(307, resolveDashboardRoute(DEFAULT_DASHBOARD_ROUTE_REF));
};
