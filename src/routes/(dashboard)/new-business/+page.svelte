<script lang="ts">
	import Page from '$lib/dashboard/leadership/list/Page.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<Page
	{data}
	scopeId="new-business-list"
	tableAriaLabel="New business accounts table"
	likelyOutOfDateTableAriaLabel="New business likely out of date accounts table"
/>
