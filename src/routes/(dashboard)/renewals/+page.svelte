<script lang="ts">
	import Page from '$lib/dashboard/leadership/list/Page.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<Page
	{data}
	scopeId="renewals-list"
	tableAriaLabel="Renewals deals table"
	likelyOutOfDateTableAriaLabel="Renewals likely out of date deals table"
/>
