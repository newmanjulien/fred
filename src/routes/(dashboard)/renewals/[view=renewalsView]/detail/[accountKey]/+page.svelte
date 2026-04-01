<script lang="ts">
	import Page from '$lib/dashboard/renewals/detail/Page.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<Page {data} />
