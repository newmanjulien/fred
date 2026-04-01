<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/support/cn';
	import {
		provideSectionTabsContext,
		resolveRequestedSectionTabId,
		resolveSelectedSectionTabId
	} from './section-tabs';

	type SectionTab = {
		id: string;
		label: string;
	};

	type Props = {
		tabs: readonly SectionTab[];
		initialTabId?: string;
		children?: Snippet;
		class?: string;
	};

	let { tabs, initialTabId, children, class: classProp = '' }: Props = $props();
	let activeTabId = $state('');
	let syncedRequestedTabId = $state('');
	const selectableTabs = $derived(tabs);

	const requestedTabId = $derived.by(() =>
		resolveRequestedSectionTabId(selectableTabs, initialTabId)
	);

	const selectedTabId = $derived.by(() => {
		return resolveSelectedSectionTabId({
			selectableTabs,
			requestedTabId,
			syncedRequestedTabId,
			activeTabId
		});
	});

	$effect(() => {
		if (requestedTabId === syncedRequestedTabId) {
			return;
		}

		syncedRequestedTabId = requestedTabId;
		activeTabId = requestedTabId;
	});

	provideSectionTabsContext({
		matches(tabId: string) {
			return selectedTabId === tabId;
		}
	});
</script>

<section class={cn('flex flex-col gap-4', classProp)}>
	<div role="tablist" class="flex items-center gap-6 border-b border-zinc-100">
		{#each tabs as tab (tab.id)}
			<button
				type="button"
				role="tab"
				aria-selected={selectedTabId === tab.id}
				class={cn(
					'inline-flex cursor-pointer items-center appearance-none border-0 border-b bg-transparent px-0 pb-3 -mb-px text-xs leading-relaxed font-medium tracking-wide transition-colors',
					selectedTabId === tab.id
						? 'border-zinc-900 text-zinc-900'
						: 'border-transparent text-zinc-500'
				)}
				onclick={() => {
					activeTabId = tab.id;
				}}
			>
				{tab.label}
			</button>
		{/each}
	</div>

	{#if children}
		{@render children()}
	{/if}
</section>
