<script lang="ts">
	import { Menu } from 'lucide-svelte';
	import type { DashboardMeeting } from '$lib/dashboard/read-models';
	import type { DashboardHeader } from '$lib/dashboard/shell/header/types';
	import { useDashboardShellState } from '$lib/dashboard/shell/state.svelte';
	import HeaderLeadingControl from './header/HeaderLeadingControl.svelte';
	import HomeLink from './HomeLink.svelte';

	type Props = {
		header: DashboardHeader | null | undefined;
		meetings: readonly DashboardMeeting[];
	};

	let { header, meetings }: Props = $props();
	const shellState = useDashboardShellState();
	const leadingControlClass =
		'!mr-0 !ml-0 h-8 min-w-0 max-w-full justify-center rounded-sm px-2 text-center hover:bg-zinc-100 hover:text-zinc-900';
</script>

<header class="flex h-11 items-center border-b border-zinc-100 bg-white px-(--shell-gutter-mobile) md:hidden">
	<div class="flex w-12 items-center">
		<HomeLink />
	</div>
	<div class="min-w-0 flex-1 px-2 text-center">
		{#if header}
			{#if header.leading.kind === 'control-title'}
				<div class="flex justify-center">
					<HeaderLeadingControl
						control={header.leading.control}
						menuId="mobile-header-leading-control"
						{meetings}
						placement="bottom"
						class={leadingControlClass}
					/>
				</div>
			{:else}
				<span class="block truncate text-xs font-medium tracking-wide text-zinc-600">
					{header.leading.title}
				</span>
			{/if}
		{/if}
	</div>
	<div class="flex w-12 justify-end">
		<button
			type="button"
			aria-label="Toggle navigation menu"
			class="inline-flex size-8 items-center justify-center rounded-sm text-zinc-700 transition-colors hover:bg-zinc-100"
			onclick={() => {
				shellState.isMobileDrawerOpen = !shellState.isMobileDrawerOpen;
			}}
		>
			<Menu class="size-4" />
		</button>
	</div>
</header>
