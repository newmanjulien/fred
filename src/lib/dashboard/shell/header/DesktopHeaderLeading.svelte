<script lang="ts">
	import { ChevronRight } from 'lucide-svelte';
	import type { DashboardMeeting } from '$lib/dashboard/read-models';
	import type { DashboardHeaderLeading } from '$lib/dashboard/shell/header/types';
	import TitleLinkMenu from '$lib/dashboard/shell/menus/TitleLinkMenu.svelte';
	import HeaderLeadingControl from './HeaderLeadingControl.svelte';

	type Props = {
		leading: DashboardHeaderLeading;
		meetings: readonly DashboardMeeting[];
	};

	let { leading, meetings }: Props = $props();

	const BASE_TITLE_CLASS = 'min-w-0 truncate text-xs font-medium tracking-wide';
	const mutedTitleClass = `${BASE_TITLE_CLASS} mr-2 ml-1 text-zinc-500`;
	const strongTitleClass = `${BASE_TITLE_CLASS} mr-2 text-zinc-900`;
	const leadingControlClass = 'mr-2 ml-1 hover:text-zinc-400';
	const titleMenuClass = 'mr-2 text-zinc-900 hover:text-zinc-700';
</script>

{#if leading.kind === 'control-title'}
	<HeaderLeadingControl
		control={leading.control}
		menuId="desktop-header-leading-control"
		placement="bottom-start"
		class={leadingControlClass}
		{meetings}
	/>
	<ChevronRight class="mr-2 h-3 w-3 text-zinc-200" />
	<p class={strongTitleClass}>
		{leading.title}
	</p>
{:else if leading.kind === 'title-menu'}
	<p class={mutedTitleClass}>
		{leading.title}
	</p>
	<ChevronRight class="mr-2 h-3 w-3 text-zinc-200" />
	<TitleLinkMenu menu={leading.menu} placement="bottom-start" class={titleMenuClass} />
{:else}
	<p class={mutedTitleClass}>
		{leading.title}
	</p>
{/if}
