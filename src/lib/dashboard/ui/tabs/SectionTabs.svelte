<script lang="ts">
	import type { Snippet } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { cn } from '$lib/support/cn';
	import {
		provideSectionTabsContext,
		resolveRequestedSectionTabId,
		resolveSelectedSectionTabId
	} from './section-tabs';

	type SectionTab = {
		id: string;
		label: string;
		disabledOnMobile?: boolean;
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
	const desktopViewport = new MediaQuery('(min-width: 768px)', true);

	const selectableTabs = $derived.by(() =>
		tabs.filter((tab) => desktopViewport.current || !tab.disabledOnMobile)
	);

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
			{@const isDisabled = !desktopViewport.current && !!tab.disabledOnMobile}
			<button
				type="button"
				role="tab"
				disabled={isDisabled}
				aria-selected={selectedTabId === tab.id}
				aria-disabled={isDisabled}
				class={cn(
					'relative inline-flex items-center appearance-none border-0 bg-transparent px-0 pb-3 text-xs leading-relaxed font-medium tracking-wide transition-colors disabled:cursor-not-allowed disabled:text-zinc-300',
					isDisabled ? 'cursor-not-allowed' : 'cursor-pointer',
					selectedTabId === tab.id && !isDisabled ? 'text-zinc-900' : 'text-zinc-500'
				)}
				onclick={() => {
					if (isDisabled) {
						return;
					}

					activeTabId = tab.id;
				}}
			>
				{tab.label}
				{#if selectedTabId === tab.id && !isDisabled}
					<span class="absolute inset-x-0 bottom-px h-px bg-zinc-900"></span>
				{/if}
			</button>
		{/each}
	</div>

	{#if children}
		{@render children()}
	{/if}
</section>
