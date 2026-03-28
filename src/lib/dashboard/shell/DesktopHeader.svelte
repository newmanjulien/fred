<script lang="ts">
	import { Ellipsis, PanelLeft } from 'lucide-svelte';
	import {
		useDashboardHeaderUiController,
		type DashboardHeaderButtonId
	} from '$lib/dashboard/shell/header/ui-controller';
	import { useDashboardShellState } from '$lib/dashboard/shell/state.svelte';
	import type { DashboardMeeting, DashboardPerson } from '$lib/dashboard/read-models';
	import type { DashboardHeader } from '$lib/dashboard/shell/header/types';
	import BrokerSwitchMenu from '$lib/dashboard/shell/menus/BrokerSwitchMenu.svelte';
	import ShareMenu from '$lib/dashboard/shell/menus/ShareMenu.svelte';
	import DesktopHeaderLeading from './header/DesktopHeaderLeading.svelte';

	type Props = {
		header: DashboardHeader | null | undefined;
		people: readonly DashboardPerson[];
		meetings: readonly DashboardMeeting[];
	};

	let { header, people, meetings }: Props = $props();
	const shellState = useDashboardShellState();
	const headerUiController = useDashboardHeaderUiController();
	const overlayState = $derived(headerUiController.getState());
	const actionButtonClass =
		'flex h-7 items-center justify-center rounded-sm border border-zinc-100 px-2 text-xs font-medium tracking-wide text-zinc-500 transition-colors hover:bg-zinc-100';

	function runHeaderButton(buttonId: DashboardHeaderButtonId) {
		void overlayState.handlers[buttonId]?.();
	}
</script>

{#if header}
	<header class="hidden h-11 items-center border-b border-zinc-100 bg-white px-4 md:flex">
		<div class="flex min-w-0 flex-1 items-center">
			<button
				type="button"
				aria-label="Toggle sidebar"
				class="mr-1 ml-1 inline-flex items-center text-xs font-medium tracking-wide text-zinc-500 transition-colors hover:text-zinc-400"
				onclick={() => {
					shellState.isSidebarExpanded = !shellState.isSidebarExpanded;
				}}
				>
					<PanelLeft class="h-3.5 w-3.5" />
				</button>

				<DesktopHeaderLeading
					leading={header.leading}
					{meetings}
				/>
			</div>

		<div class="flex items-center gap-2">
			{#if header.actions}
				{#each header.actions as action (action)}
					{#if action === 'broker-switch'}
						<BrokerSwitchMenu menuId="desktop-broker-switch" {people} />
					{:else if action === 'share'}
						<ShareMenu menuId="desktop-share" {people} />
					{/if}
				{/each}
			{/if}

			{#each overlayState.buttons as button (button.id)}
				<button
					type="button"
					data-dashboard-header-overlay-button
					data-dashboard-header-button={button.id}
					class={actionButtonClass}
					onclick={() => runHeaderButton(button.id)}
				>
					{button.label}
				</button>
			{/each}

			<button
				type="button"
				aria-label="More actions"
				class="flex h-7 w-7 items-center justify-center rounded-sm border border-zinc-100 text-zinc-500 transition-colors hover:bg-zinc-100"
			>
				<Ellipsis class="h-3 w-3" />
			</button>
		</div>
	</header>
{/if}
