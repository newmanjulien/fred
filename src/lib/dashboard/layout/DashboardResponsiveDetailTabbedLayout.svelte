<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useDashboardViewportState } from '$lib/dashboard/layout/viewport.svelte';
	import type { DetailRightRailData } from '$lib/dashboard/detail/right-rail';
	import type { CanvasHeroData, CanvasHeroIcon } from '$lib/dashboard/ui/detail/CanvasHero.types';
	import DashboardDetailTabbedLayout from './DashboardDetailTabbedLayout.svelte';
	import type { DashboardDetailRailWidth, DashboardLayoutWidth } from './tokens';

	type SectionTab = {
		id: string;
		label: string;
	};

	type Props = {
		desktopTabs: readonly SectionTab[];
		mobileTabs: readonly SectionTab[];
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
		desktopTabs,
		mobileTabs,
		initialTabId,
		hero,
		icon,
		width = 'normal',
		railWidth = 'standard',
		class: classProp = '',
		rightRailData,
		body
	}: Props = $props();

	const viewport = useDashboardViewportState();
	const tabs = $derived(viewport.desktop.current ? desktopTabs : mobileTabs);
</script>

<DashboardDetailTabbedLayout
	{tabs}
	{initialTabId}
	{hero}
	{icon}
	{width}
	{railWidth}
	class={classProp}
	{rightRailData}
	{body}
/>
