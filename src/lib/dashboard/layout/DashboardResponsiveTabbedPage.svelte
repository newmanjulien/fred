<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useDashboardViewportState } from '$lib/dashboard/layout/viewport.svelte';
	import type { CanvasHeroData, CanvasHeroIcon } from '$lib/dashboard/ui/detail/CanvasHero.types';
	import type { DashboardLayoutWidth } from './tokens';
	import DashboardTabbedPage from './DashboardTabbedPage.svelte';

	type SectionTab = {
		id: string;
		label: string;
	};

	type Props = {
		desktopTabs: readonly SectionTab[];
		mobileTabs: readonly SectionTab[];
		initialTabId?: string;
		hero?: CanvasHeroData;
		icon?: CanvasHeroIcon;
		width?: DashboardLayoutWidth;
		class?: string;
		body?: Snippet;
	};

	let {
		desktopTabs,
		mobileTabs,
		initialTabId,
		hero,
		icon,
		width = 'normal',
		class: classProp = '',
		body
	}: Props = $props();

	const viewport = useDashboardViewportState();
	const tabs = $derived(viewport.desktop.current ? desktopTabs : mobileTabs);
</script>

<DashboardTabbedPage {tabs} {initialTabId} {hero} {icon} {width} class={classProp} {body} />
