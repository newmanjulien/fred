<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useSectionTabsContext } from './section-tabs';

	type Props = {
		tabId: string;
		children?: Snippet;
	};

	let { tabId, children }: Props = $props();
	const sectionTabs = useSectionTabsContext();
</script>

{#if sectionTabs.matches(tabId) && children}
	<div role="tabpanel">
		{@render children()}
	</div>
{/if}
