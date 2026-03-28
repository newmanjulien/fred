<script lang="ts">
	import { Check, Search, X } from 'lucide-svelte';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/support/cn';
	import {
		getFilteredOptions,
		getInitialHighlightedOptionId,
		getNextHighlightedOptionId,
		type SearchableFilterPanelOption
	} from '$lib/dashboard/ui/pickers/filter-panel';

	type SearchableFilterPanelRowState = {
		selected: boolean;
		highlighted: boolean;
		onClick: () => void;
		onMouseEnter: () => void;
	};

	type Props = {
		mode?: 'single' | 'multiple';
		options: readonly SearchableFilterPanelOption[];
		selectedValues?: readonly string[];
		onSelect: (optionId: string) => void;
		onRequestClose?: () => void;
		searchLabel?: string;
		searchPlaceholder?: string;
		emptyLabel?: string;
		listClass?: string;
		optionRow?: Snippet<[SearchableFilterPanelOption, SearchableFilterPanelRowState]>;
	};

	let {
		mode = 'single',
		options,
		selectedValues = [],
		onSelect,
		onRequestClose,
		searchLabel = 'Search',
		searchPlaceholder = 'Search',
		emptyLabel = 'No results found',
		listClass = 'max-h-56',
		optionRow
	}: Props = $props();

	let searchElement = $state<HTMLInputElement | null>(null);
	let searchQuery = $state('');

	const filteredOptions = $derived(
		getFilteredOptions({
			options,
			query: searchQuery,
			selectedValues,
			sortSelectedFirst: mode === 'multiple'
		})
	);
	let highlightedOptionId: string | null = $derived(
		getInitialHighlightedOptionId({
			options: filteredOptions,
			selectedValues
		})
	);

	function isSelected(optionId: string) {
		return selectedValues.includes(optionId);
	}

	function handleOptionSelect(optionId: string) {
		onSelect(optionId);

		if (mode === 'single') {
			onRequestClose?.();
		}
	}

	function handleSearchKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			highlightedOptionId = getNextHighlightedOptionId({
				options: filteredOptions,
				currentOptionId: highlightedOptionId,
				direction: 1
			});
			return;
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault();
			highlightedOptionId = getNextHighlightedOptionId({
				options: filteredOptions,
				currentOptionId: highlightedOptionId,
				direction: -1
			});
			return;
		}

		if (event.key === 'Enter') {
			event.preventDefault();

			if (highlightedOptionId) {
				handleOptionSelect(highlightedOptionId);
			}
			return;
		}

		if (event.key === 'Escape') {
			event.preventDefault();
			onRequestClose?.();
		}
	}

	$effect(() => {
		searchElement?.focus();
	});
</script>

<div class="rounded-md border border-zinc-100 bg-white p-0">
	<div class="border-b border-zinc-100 p-2">
		<div class="relative">
			<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
				<Search class="size-4 text-zinc-400" />
			</div>
			<input
				bind:this={searchElement}
				type="text"
				aria-label={searchLabel}
				placeholder={searchPlaceholder}
				autocapitalize="none"
				autocomplete="off"
				spellcheck="false"
				class="h-9 w-full rounded-md border border-zinc-100 bg-zinc-50 pr-7 pl-7 text-xs tracking-wide text-zinc-700 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-200 focus:bg-white"
				bind:value={searchQuery}
				onkeydown={handleSearchKeydown}
			/>
			{#if searchQuery.length > 0}
				<button
					type="button"
					aria-label={`Clear ${searchLabel.toLocaleLowerCase()}`}
					class="absolute inset-y-0 right-0 flex items-center pr-2.5 text-zinc-400 transition-colors hover:text-zinc-600 focus:text-zinc-600"
					style="color: inherit;"
					onclick={() => {
						searchQuery = '';
						searchElement?.focus();
					}}
				>
					<X class="size-4" />
				</button>
			{/if}
		</div>
	</div>

	{#if filteredOptions.length > 0}
		<ul class={cn(listClass, 'space-y-1 overflow-y-auto p-1')} role="listbox">
			{#each filteredOptions as option (option.id)}
				{@const selected = isSelected(option.id)}
				{@const highlighted = highlightedOptionId === option.id}
				<li>
					{#if optionRow}
						{@render optionRow(option, {
							selected,
							highlighted,
							onClick: () => handleOptionSelect(option.id),
							onMouseEnter: () => {
								highlightedOptionId = option.id;
							}
						})}
					{:else}
						<button
							type="button"
							role="option"
							aria-selected={selected}
							class={cn(
								'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors hover:bg-zinc-100',
								selected ? 'bg-zinc-50 text-zinc-900' : 'text-zinc-700',
								highlighted && 'bg-zinc-100 text-zinc-900'
							)}
							onmouseenter={() => {
								highlightedOptionId = option.id;
							}}
							onclick={() => handleOptionSelect(option.id)}
						>
							<span class="truncate">{option.label}</span>
							<Check
								class={cn(
									'ml-3 size-3.5 shrink-0 text-zinc-400',
									selected ? 'opacity-100' : 'opacity-0'
								)}
							/>
						</button>
					{/if}
				</li>
			{/each}
		</ul>
	{:else}
		<p class="px-3 py-3 text-xs tracking-wide text-zinc-500">
			{emptyLabel}
		</p>
	{/if}
</div>
