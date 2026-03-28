import { getContext, setContext } from 'svelte';

const DASHBOARD_SHELL_STATE_KEY = Symbol('dashboard-shell-state');

export type DashboardShellState = {
	isSidebarExpanded: boolean;
	isMobileDrawerOpen: boolean;
};

export function provideDashboardShellState(shellState: DashboardShellState) {
	return setContext(DASHBOARD_SHELL_STATE_KEY, shellState);
}

export function useDashboardShellState() {
	return getContext<DashboardShellState>(DASHBOARD_SHELL_STATE_KEY);
}
