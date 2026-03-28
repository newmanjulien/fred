<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { CanvasHeroData, CanvasHeroIcon } from '$lib/dashboard/ui/detail/CanvasHero.types';
	import SectionTabs from '$lib/dashboard/ui/tabs/SectionTabs.svelte';
	import type { DashboardLayoutWidth } from './tokens';
	import DashboardPageLayout from './DashboardPageLayout.svelte';

	type SectionTab = {
		id: string;
		label: string;
		disabledOnMobile?: boolean;
	};

	type Props = {
		tabs: readonly SectionTab[];
		initialTabId?: string;
		hero?: CanvasHeroData;
		icon?: CanvasHeroIcon;
		width?: DashboardLayoutWidth;
		class?: string;
		body?: Snippet;
	};

	let {
		tabs,
		initialTabId,
		hero,
		icon,
		width = 'normal',
		class: classProp = '',
		body: bodySnippet
	}: Props = $props();
</script>

<DashboardPageLayout {hero} {icon} {width} class={classProp}>
	{#snippet body()}
		<SectionTabs {tabs} {initialTabId}>
			{#if bodySnippet}
				{@render bodySnippet()}
			{/if}
		</SectionTabs>
	{/snippet}
</DashboardPageLayout>
