<script lang="ts">
	import { Rss } from 'lucide-svelte';
	import type { MyAccountsDetailPageData } from '$lib/dashboard/page-models/myAccounts';
	import DashboardDetailTabbedLayout from '$lib/dashboard/layout/DashboardDetailTabbedLayout.svelte';
	import FileUploadField from '$lib/dashboard/ui/detail/FileUploadField.svelte';
	import TimelineSection from '$lib/dashboard/ui/detail/TimelineSection.svelte';
	import SectionTabPanel from '$lib/dashboard/ui/tabs/SectionTabPanel.svelte';
	import NewsList from '../list/NewsList.svelte';

	type Props = {
		data: MyAccountsDetailPageData;
	};

	let { data }: Props = $props();

	const tabs = [
		{ id: 'news', label: 'News' },
		{ id: 'activity', label: 'Activity' },
		{ id: 'update', label: 'Update', disabledOnMobile: true }
	] as const;
</script>

<DashboardDetailTabbedLayout
	hero={data.hero}
	icon={Rss}
	rightRailData={data.rightRail}
	initialTabId={data.route.tab}
	{tabs}
>
	{#snippet body()}
		<SectionTabPanel tabId="news">
			<NewsList items={data.newsItems} />
		</SectionTabPanel>
		<SectionTabPanel tabId="activity">
			<TimelineSection items={data.activityItems} />
		</SectionTabPanel>
		<SectionTabPanel tabId="update">
			<FileUploadField data={data.update} />
		</SectionTabPanel>
	{/snippet}
</DashboardDetailTabbedLayout>
