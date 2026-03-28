<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { DetailRightRailData } from '$lib/dashboard/detail/right-rail';
	import type { CanvasHeroData, CanvasHeroIcon } from '$lib/dashboard/ui/detail/CanvasHero.types';
	import CanvasHero from '$lib/dashboard/ui/detail/CanvasHero.svelte';
	import DetailRightRail from '$lib/dashboard/ui/detail/DetailRightRail.svelte';
	import {
		getDashboardDetailRailWidth,
		getDashboardLayoutMaxWidth,
		type DashboardDetailRailWidth,
		type DashboardLayoutWidth
	} from './tokens';

	type Props = {
		hero: CanvasHeroData;
		icon?: CanvasHeroIcon;
		width?: DashboardLayoutWidth;
		railWidth?: DashboardDetailRailWidth;
		class?: string;
		rightRailData: DetailRightRailData;
		body?: Snippet;
	};

	let {
		hero,
		icon,
		width = 'normal',
		railWidth = 'standard',
		class: classProp = '',
		rightRailData,
		body
	}: Props = $props();

	const maxWidth = $derived(getDashboardLayoutMaxWidth(width));
	const detailRailWidth = $derived(getDashboardDetailRailWidth(railWidth));
	const layoutClass = $derived(
		classProp ? `dashboard-detail-layout grid min-h-full grid-cols-1 ${classProp}` : 'dashboard-detail-layout grid min-h-full grid-cols-1'
	);
</script>

<div
	class={layoutClass}
	style={`--dashboard-feed-max-width: ${maxWidth}; --dashboard-detail-rail-width: ${detailRailWidth};`}
>
		<div class="min-w-0">
			<div class="relative mx-auto w-full" style={`max-width: ${maxWidth};`}>
					<div class="px-4 pt-8 pb-6 sm:px-6 lg:px-8">
						<CanvasHero {hero} {icon} />
						{#if body}
							{@render body()}
						{/if}
				</div>
			</div>
		</div>

	<aside class="dashboard-detail-rail-shell hidden w-full lg:block lg:border-l lg:border-zinc-100">
		<div class="dashboard-detail-rail-frame mx-auto w-full px-4 sm:px-6 lg:max-w-none lg:px-0">
			<div
				class="dashboard-detail-rail-surface overflow-hidden rounded-sm border border-zinc-100 bg-white lg:rounded-none lg:border-0"
			>
				<DetailRightRail data={rightRailData} />
			</div>
		</div>
	</aside>
</div>

<style>
	.dashboard-detail-layout {
		--dashboard-feed-max-width: 48rem;
		--dashboard-detail-rail-width: 22rem;
	}

	@media (min-width: 1024px) {
		.dashboard-detail-layout {
			min-height: 100cqh;
			grid-template-columns: minmax(0, 1fr) var(--dashboard-detail-rail-width);
		}

		.dashboard-detail-rail-frame {
			height: 100%;
		}

		.dashboard-detail-rail-surface {
			position: sticky;
			top: 0;
			height: 100cqh;
			overflow-y: auto;
		}
	}
</style>
