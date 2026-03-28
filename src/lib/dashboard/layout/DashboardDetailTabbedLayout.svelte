<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { DetailRightRailData } from '$lib/dashboard/detail/right-rail';
	import SectionTabs from '$lib/dashboard/ui/tabs/SectionTabs.svelte';
	import type { CanvasHeroData, CanvasHeroIcon } from '$lib/dashboard/ui/detail/CanvasHero.types';
	import DashboardDetailLayout from './DashboardDetailLayout.svelte';
	import type { DashboardDetailRailWidth, DashboardLayoutWidth } from './tokens';

	type SectionTab = {
		id: string;
		label: string;
		disabledOnMobile?: boolean;
	};

	type Props = {
		tabs: readonly SectionTab[];
		initialTabId?: string;
		hero: CanvasHeroData;
		icon?: CanvasHeroIcon;
		width?: DashboardLayoutWidth;
		railWidth?: DashboardDetailRailWidth;
		class?: string;
		rightRailData: DetailRightRailData;
		body?: Snippet;
	};

	let {
		tabs,
		initialTabId,
		hero,
		icon,
		width = 'normal',
		railWidth = 'standard',
		class: classProp = '',
		rightRailData,
		body: bodySnippet
	}: Props = $props();
</script>

<DashboardDetailLayout
	{hero}
	{icon}
	{width}
	{railWidth}
	class={classProp}
	{rightRailData}
>
	{#snippet body()}
		<SectionTabs {tabs} {initialTabId}>
			{#if bodySnippet}
				{@render bodySnippet()}
			{/if}
		</SectionTabs>
	{/snippet}
</DashboardDetailLayout>
