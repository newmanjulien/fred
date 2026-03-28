<script lang="ts">
	import type { DashboardMeeting } from '$lib/dashboard/read-models';
	import { formatIsoDateMonthDayLong } from '$lib/format/date-time';
	import SearchableFilterPanel from '$lib/dashboard/ui/pickers/SearchableFilterPanel.svelte';

	type Props = {
		surface?: 'embedded' | 'raised';
		meetings: readonly DashboardMeeting[];
		selectedMeetingKey?: DashboardMeeting['key'] | null;
		onSelect: (meetingKey: DashboardMeeting['key']) => void;
		onRequestClose?: () => void;
	};

	let {
		surface = 'embedded',
		meetings,
		selectedMeetingKey = null,
		onSelect,
		onRequestClose
	}: Props = $props();

	const options = $derived(
		meetings.map((meeting) => ({
			id: meeting.key,
			label: formatIsoDateMonthDayLong(meeting.dateIso)
		}))
	);
</script>

<SearchableFilterPanel
	{surface}
	{options}
	selectedValues={selectedMeetingKey ? [selectedMeetingKey] : []}
	onSelect={(meetingKey) => onSelect(meetingKey as DashboardMeeting['key'])}
	{onRequestClose}
	searchLabel="Search meeting dates"
	searchPlaceholder="Search meeting dates"
	emptyLabel="No meeting dates found"
/>
