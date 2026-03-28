<script lang="ts">
	import { resolve } from '$app/paths';
	import type { DashboardMeeting } from '$lib/dashboard/read-models';
	import { resolveMyDealsListPath } from '$lib/dashboard/routing/my-deals';
	import { resolveNewBusinessListPath } from '$lib/dashboard/routing/new-business';
	import { resolveOpportunitiesListPath } from '$lib/dashboard/routing/opportunities';
	import { resolveSinceLastMeetingPath } from '$lib/dashboard/routing/since-last-meeting';
	import type { DashboardHeaderControl } from '$lib/dashboard/shell/header/types';
	import MeetingDateMenu from '$lib/dashboard/shell/menus/MeetingDateMenu.svelte';

	const BASE_LEADING_CONTROL_CLASS =
		'dashboard-header-leading-control inline-flex items-center text-xs font-medium tracking-wide transition-colors';

	type Props = {
		control: DashboardHeaderControl;
		menuId: string;
		meetings: readonly DashboardMeeting[];
		placement?: 'bottom-start' | 'bottom-end' | 'bottom';
		class?: string;
	};

	let {
		control,
		menuId,
		meetings,
		placement = 'bottom-start',
		class: classProp = ''
	}: Props = $props();

	const controlClass = $derived(
		classProp ? `${BASE_LEADING_CONTROL_CLASS} ${classProp}` : BASE_LEADING_CONTROL_CLASS
	);
</script>

{#if control.kind === 'meeting-date'}
	<MeetingDateMenu
		{menuId}
		{control}
		{meetings}
		{placement}
		class={controlClass}
	/>
{:else if control.kind === 'my-deals-back-link'}
	<a href={resolve(resolveMyDealsListPath(control.view))} class={controlClass}>
		{control.label}
	</a>
{:else if control.kind === 'new-business-back-link'}
	<a href={resolve(resolveNewBusinessListPath(control.view))} class={controlClass}>
		{control.label}
	</a>
{:else if control.kind === 'opportunities-back-link'}
	<a href={resolve(resolveOpportunitiesListPath(control.meetingKey))} class={controlClass}>
		{control.label}
	</a>
{:else}
	<a href={resolve(resolveSinceLastMeetingPath(control.meetingKey))} class={controlClass}>
		{control.label}
	</a>
{/if}
