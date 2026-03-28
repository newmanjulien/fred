<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { DashboardMeeting } from '$lib/dashboard/read-models';
	import { formatIsoDateMonthDayLong } from '$lib/format/date-time';
	import type { DashboardHeaderMeetingDateControl } from '$lib/dashboard/shell/header/types';
	import MeetingPickerPanel from '$lib/dashboard/ui/pickers/MeetingPickerPanel.svelte';
	import { resolveOpportunitiesListPath } from '$lib/dashboard/routing/opportunities';
	import { resolveSinceLastMeetingPath } from '$lib/dashboard/routing/since-last-meeting';
	import SearchableMenuSurface from './SearchableMenuSurface.svelte';
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

	function selectMeeting(meetingKey: DashboardMeeting['key']) {
		menu.close();
		void goto(resolve(resolveMeetingHref(meetingKey)));
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
		<SearchableMenuSurface panelId={menu.panelId} class={menu.menuSurfaceClass}>
			<MeetingPickerPanel
				surface="raised"
				{meetings}
				selectedMeetingKey={triggerMeeting?.key ?? null}
				onSelect={selectMeeting}
				onRequestClose={menu.close}
			/>
		</SearchableMenuSurface>
	{/if}
</div>
