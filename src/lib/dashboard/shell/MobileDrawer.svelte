<script lang="ts">
	import { X } from 'lucide-svelte';
	import type { DashboardRouteRef } from '$lib/dashboard/routing';
	import { useDashboardShellState } from '$lib/dashboard/shell/state.svelte';
	import HomeLink from './HomeLink.svelte';
	import NavList from './nav/NavList.svelte';
	import { DASHBOARD_NAV_SECTIONS } from './nav/model';

	type Props = {
		route: DashboardRouteRef;
	};

	let { route }: Props = $props();
	const currentRoute = $derived(route);
	const shellState = useDashboardShellState();
</script>

{#if shellState.isMobileDrawerOpen}
	<div class="app-layer-drawer fixed inset-0 pointer-events-auto md:hidden">
		<aside id="mobile-nav-drawer" class="flex h-full flex-col bg-white">
			<header class="flex h-11 items-center border-b border-zinc-100 bg-white px-(--shell-gutter-mobile)">
				<HomeLink
					onclick={() => {
						shellState.isMobileDrawerOpen = false;
					}}
				/>
				<button
					type="button"
					aria-label="Close navigation menu"
					class="ml-auto inline-flex size-8 items-center justify-center rounded-sm text-zinc-700 transition-colors hover:bg-zinc-100"
					onclick={() => {
						shellState.isMobileDrawerOpen = false;
					}}
				>
					<X class="size-4" />
				</button>
			</header>

			<div class="flex-1 overflow-y-auto px-(--shell-gutter-mobile) py-4">
				<nav aria-label="Dashboard navigation" class="relative mt-2 flex min-h-full flex-col">
					<NavList
						sections={DASHBOARD_NAV_SECTIONS}
						{currentRoute}
						expanded={true}
						renderMode="mobile"
						onSelectRoute={() => {
							shellState.isMobileDrawerOpen = false;
						}}
					/>
				</nav>
			</div>
		</aside>
	</div>
{/if}
