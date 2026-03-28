<script lang="ts">
	import { ChevronsUpDown } from 'lucide-svelte';
	import type { DashboardRouteRef } from '$lib/dashboard/routing';
	import { useDashboardShellState } from '$lib/dashboard/shell/state.svelte';
	import PersonAvatar from '$lib/dashboard/ui/people/PersonAvatar.svelte';
	import { cn } from '$lib/support/cn';
	import { sidebarIndicator } from './sidebar-indicator';
	import HomeLink from './HomeLink.svelte';
	import NavList from './nav/NavList.svelte';
	import {
		DASHBOARD_NAV_SECTIONS,
		getActiveDashboardNavRoute,
		type DashboardNavRouteRef
	} from './nav/model';

	type Props = {
		route: DashboardRouteRef;
		defaultBroker: {
			name: string;
			avatar: string;
		};
		class?: string;
	};

	let { route, defaultBroker, class: className = '' }: Props = $props();

	const shellState = useDashboardShellState();
	const currentRoute = $derived(route);
	const activeRoute = $derived(getActiveDashboardNavRoute(currentRoute));
	let hoveredRoute = $state<DashboardNavRouteRef | null>(null);

	const bottomRouteKinds = new Set(
		DASHBOARD_NAV_SECTIONS.flatMap((section) =>
			section.id === 'bottom'
				? section.items.flatMap((item) => (item.kind === 'route' ? [item.route.kind] : []))
				: []
		)
	);
	const indicatorTarget = $derived.by(() => {
		const targetRoute = hoveredRoute ?? activeRoute;

		return {
			targetKey: targetRoute?.kind ?? null,
			enabled: Boolean(targetRoute && !bottomRouteKinds.has(targetRoute.kind))
		};
	});
</script>

<aside
	class={cn(
		'flex w-(--dashboard-sidebar-width) shrink-0 self-stretch flex-col overflow-hidden pt-2.5 pl-(--dashboard-sidebar-pad-left) pr-(--dashboard-sidebar-pad-right) transition-[width,padding] duration-200',
		shellState.isSidebarExpanded ? 'items-stretch' : 'items-start',
		className
	)}
	aria-label="Dashboard sidebar"
>
	<div class="mb-4 ml-0.5 flex w-full items-center pr-0.5">
		<HomeLink class="shrink-0" />

		<div
			class={cn(
				'ml-auto flex shrink-0 items-center overflow-hidden transition-[max-width,opacity,transform] duration-200',
				shellState.isSidebarExpanded
					? 'max-w-24 translate-x-0 opacity-100'
					: 'pointer-events-none max-w-0 translate-x-1 opacity-0'
			)}
			>
				<div class="inline-flex h-6 origin-center scale-110 items-center gap-1 rounded-full border border-zinc-100 bg-zinc-50 px-1 text-zinc-100">
					<PersonAvatar person={defaultBroker} size={20} class="border border-zinc-100 bg-white" />
					<ChevronsUpDown aria-hidden="true" class="h-3 w-3 text-zinc-400" />
				</div>
			</div>
	</div>

	<nav
		use:sidebarIndicator={indicatorTarget}
		class="relative flex min-h-0 flex-1 flex-col"
		aria-label="Dashboard navigation"
		onmouseleave={() => {
			hoveredRoute = null;
		}}
	>
		<span
			aria-hidden="true"
			class="sidebar-nav-indicator pointer-events-none absolute rounded-sm bg-zinc-200/60 transition-[top,left,width,height,opacity] duration-200 ease-out"
		></span>
		<NavList
			sections={DASHBOARD_NAV_SECTIONS}
			{currentRoute}
			expanded={shellState.isSidebarExpanded}
			renderMode="desktop"
			onHoverRoute={(route, sectionId) => {
				hoveredRoute = sectionId === 'bottom' ? null : route;
			}}
		/>
	</nav>
</aside>
