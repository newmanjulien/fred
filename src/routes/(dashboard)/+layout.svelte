<script lang="ts">
	import { page } from '$app/state';
	import { MediaQuery } from 'svelte/reactivity';
	import DesktopHeader from '$lib/dashboard/shell/DesktopHeader.svelte';
	import MobileDrawer from '$lib/dashboard/shell/MobileDrawer.svelte';
	import MobileHeader from '$lib/dashboard/shell/MobileHeader.svelte';
	import {
		createDashboardHeaderUiController,
		provideDashboardHeaderUiController
	} from '$lib/dashboard/shell/header/ui-controller';
	import Sidebar from '$lib/dashboard/shell/Sidebar.svelte';
	import {
		provideDashboardShellState,
		type DashboardShellState
	} from '$lib/dashboard/shell/state.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const header = $derived(page.data.header ?? null);
	const route = $derived(data.route);
	const dashboardShell = $derived(data.dashboardShell);
	const desktopViewport = new MediaQuery('(min-width: 768px)', true);
	const shellState = $state<DashboardShellState>({
		isSidebarExpanded: false,
		isMobileDrawerOpen: false
	});
	const headerUiController = createDashboardHeaderUiController();

	provideDashboardShellState(shellState);
	provideDashboardHeaderUiController(headerUiController);

	$effect(() => {
		if (desktopViewport.current && shellState.isMobileDrawerOpen) {
			shellState.isMobileDrawerOpen = false;
		}
	});
</script>

<div class="h-dvh min-h-dvh overflow-hidden bg-zinc-50">
	<div
		class="dashboard-canvas flex h-full min-h-0 md:gap-(--dashboard-canvas-gap)"
		data-sidebar-state={desktopViewport.current && shellState.isSidebarExpanded ? 'expanded' : 'collapsed'}
	>
		<Sidebar {route} defaultBroker={data.defaultBroker} class="hidden md:flex" />
		<main class="min-w-0 flex min-h-0 flex-1 flex-col overflow-hidden bg-white md:rounded-sm md:border md:border-zinc-100">
			<MobileDrawer {route} />
			<MobileHeader
				{header}
				meetings={dashboardShell.meetings}
			/>
			<div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
				<DesktopHeader
					{header}
					people={dashboardShell.people}
					meetings={dashboardShell.meetings}
				/>
				<div class="dashboard-main-viewport min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
					<div class="min-h-full min-w-0">
						{@render children()}
					</div>
				</div>
			</div>
		</main>
	</div>
</div>
