<script lang="ts">
	import { useDashboardViewportState } from '$lib/dashboard/layout/viewport.svelte';
	import type {
		NewBusinessListPageData,
		RenewalsListPageData
	} from '$lib/dashboard/page-models';
	import type { NewBusinessView } from '$lib/dashboard/routing/new-business';
	import type { RenewalsView } from '$lib/dashboard/routing/renewals';
	import DesktopPage from './DesktopPage.svelte';
	import MobilePage from './MobilePage.svelte';

	const NEW_BUSINESS_INFO_BAR_TEXT_BY_VIEW: Partial<Record<NewBusinessView, string>> = {
		accounts: 'All the new business your brokers are working on',
		'next-60-days':
			'Accounts which might close in the next 60 days',
		'need-support':
			'Accounts where the broker may need support',
		'duplicated-work':
			'Accounts where multiple brokers are doing the same work',
		unassigned: 'Unassigned accounts which are not being worked by any broker',
		'likely-out-of-date':
			"We suspect that our data is out of date and you may want to ask the broker for an update"
	};

	const RENEWALS_INFO_BAR_TEXT_BY_VIEW: Partial<Record<RenewalsView, string>> = {
		accounts: 'All the renewals your brokers are working on',
		'didnt-renew': "Accounts that didn't renew",
		'next-60-days':
			'Accounts which might renew in the next 60 days',
		'need-support':
			'Accounts where the broker may need support',
		'likely-out-of-date':
			"We suspect that our data is out of date and you may want to ask the broker for an update"
	};

	type LeadershipListPageData = NewBusinessListPageData | RenewalsListPageData;

	type Props = {
		data: LeadershipListPageData;
		scopeId: string;
		tableAriaLabel: string;
		likelyOutOfDateTableAriaLabel: string;
	};

	let {
		data,
		scopeId,
		tableAriaLabel,
		likelyOutOfDateTableAriaLabel
	}: Props = $props();
	const viewport = useDashboardViewportState();

	function getInfoBarText(data: LeadershipListPageData) {
		if (data.route.kind === 'new-business-list') {
			return NEW_BUSINESS_INFO_BAR_TEXT_BY_VIEW[data.route.view] ?? null;
		}

		return RENEWALS_INFO_BAR_TEXT_BY_VIEW[data.route.view] ?? null;
	}
</script>

{#if viewport.desktop.current}
	<DesktopPage
		{data}
		{scopeId}
		{tableAriaLabel}
		{likelyOutOfDateTableAriaLabel}
		infoText={getInfoBarText(data)}
	/>
{:else}
	<MobilePage
		{data}
		{tableAriaLabel}
		{likelyOutOfDateTableAriaLabel}
		infoText={getInfoBarText(data)}
	/>
{/if}
