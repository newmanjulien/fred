import { getContext, hasContext, setContext } from 'svelte';
import type { MediaQuery } from 'svelte/reactivity';

const DASHBOARD_VIEWPORT_STATE_KEY = Symbol('dashboard-viewport-state');

export type DashboardViewportState = {
	desktop: MediaQuery;
};

const FALLBACK_DASHBOARD_VIEWPORT_STATE: DashboardViewportState = {
	desktop: { current: true } as MediaQuery
};

export function provideDashboardViewportState(viewportState: DashboardViewportState) {
	return setContext(DASHBOARD_VIEWPORT_STATE_KEY, viewportState);
}

export function useDashboardViewportState() {
	if (!hasContext(DASHBOARD_VIEWPORT_STATE_KEY)) {
		return FALLBACK_DASHBOARD_VIEWPORT_STATE;
	}

	return getContext<DashboardViewportState>(DASHBOARD_VIEWPORT_STATE_KEY);
}
