<script lang="ts">
	import { resolve } from '$app/paths';
	import type { DashboardMeeting } from '$lib/dashboard/read-models';
	import { formatIsoDateMonthDayLong } from '$lib/format/date-time';
	import type { DashboardHeaderMeetingDateControl } from '$lib/dashboard/shell/header/types';
	import { cn } from '$lib/support/cn';
	import { resolveOpportunitiesListPath } from '$lib/dashboard/routing/opportunities';
	import { resolveSinceLastMeetingPath } from '$lib/dashboard/routing/since-last-meeting';
	import DashboardMenuPanel from './DashboardMenuPanel.svelte';
	import {
		type DashboardMenuPlacement,
		dismissibleMenu
	} from './menu-interactions';
	import { useDashboardMenu } from './menu-state.svelte';

	type Props = {
		menuId: string;
		control: DashboardHeaderMeetingDateControl;
		meetings: readonly DashboardMeeting[];
		placement?: DashboardMenuPlacement;
		class?: string;
	};

	let {
		menuId,
		control,
		meetings: unsortedMeetings,
		placement = 'bottom-start',
		class: classProp = ''
	}: Props = $props();
	const menu = useDashboardMenu(
		() => menuId,
		() => placement
	);

	const meetings = $derived(
		[...unsortedMeetings].sort((left, right) => right.dateIso.localeCompare(left.dateIso))
	);
	const meetingDateLabels = $derived(meetings.map((meeting) => formatIsoDateMonthDayLong(meeting.dateIso)));
	const triggerMeeting = $derived(
		meetings.find((meeting) => meeting.key === control.meetingKey) ?? meetings[0] ?? null
	);
	const triggerDateLabel = $derived(
		triggerMeeting ? formatIsoDateMonthDayLong(triggerMeeting.dateIso) : 'Select meeting date'
	);

	function resolveMeetingHref(meetingKey: DashboardMeeting['key']) {
		return control.pageKind === 'opportunities'
			? resolveOpportunitiesListPath(meetingKey)
			: resolveSinceLastMeetingPath(meetingKey);
	}
</script>

<div
	use:dismissibleMenu={{ open: menu.isOpen, close: menu.close, trigger: menu.triggerElement }}
	class="relative inline-flex shrink-0"
>
	<button
		bind:this={menu.triggerElement}
		type="button"
		aria-haspopup="menu"
		aria-expanded={menu.isOpen}
		aria-controls={menu.isOpen ? menu.panelId : undefined}
		class={classProp}
		onclick={menu.toggle}
	>
		<span>{triggerMeeting ? `${triggerDateLabel} meeting` : triggerDateLabel}</span>
	</button>

	{#if menu.isOpen}
		<DashboardMenuPanel panelId={menu.panelId} class={menu.menuPanelClass} title="Select meeting date">
			{#snippet body()}
				<ul class="mt-1 space-y-1">
					{#each meetings as meeting, index (meeting.key)}
						<li>
							<a
								role="menuitemradio"
								aria-checked={meeting.key === triggerMeeting?.key}
								href={resolve(resolveMeetingHref(meeting.key))}
								class={cn(
									'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs transition-colors hover:bg-zinc-100',
									meeting.key === triggerMeeting?.key ? 'bg-zinc-50 text-zinc-900' : 'text-zinc-700'
								)}
								onclick={menu.close}
							>
								<span class="font-medium">{meetingDateLabels[index] ?? meeting.dateIso}</span>
							</a>
						</li>
					{/each}
				</ul>
			{/snippet}
		</DashboardMenuPanel>
	{/if}
</div>
