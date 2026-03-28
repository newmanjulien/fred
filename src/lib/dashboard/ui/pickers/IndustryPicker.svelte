<script lang="ts">
	import { ChevronDown } from 'lucide-svelte';
	import { cn } from '$lib/support/cn';
	import { dismissibleMenu } from '$lib/dashboard/shell/menus/menu-interactions';
	import IndustryPickerPanel from '$lib/dashboard/ui/pickers/IndustryPickerPanel.svelte';
	import type { IndustryPickerOption } from '$lib/dashboard/ui/pickers/IndustryPickerPanel.svelte';
	import type { DealIndustry } from '$lib/types/vocab';

	type Props = {
		summary: string;
		options: readonly IndustryPickerOption[];
		selectedValue: DealIndustry;
		onSelect: (industry: DealIndustry) => void;
		searchLabel?: string;
		searchPlaceholder?: string;
		emptyLabel?: string;
	};

	let {
		summary,
		options,
		selectedValue,
		onSelect,
		searchLabel = 'Search industries',
		searchPlaceholder = 'Search industries',
		emptyLabel = 'No industries found'
	}: Props = $props();

	let isOpen = $state(false);
	let triggerElement = $state<HTMLButtonElement | null>(null);

	const triggerClass =
		'flex w-full items-center justify-between gap-3 rounded-md border border-zinc-100 bg-zinc-50/70 px-2.5 py-1.5 text-left transition-colors hover:border-zinc-200 hover:bg-zinc-50 focus-visible:border-zinc-300 focus-visible:bg-white focus-visible:outline-none';
	const summaryClass = 'min-w-0 truncate text-[11px] tracking-wide text-zinc-700';

	function closePicker() {
		isOpen = false;
		triggerElement?.focus();
	}

	function togglePicker() {
		isOpen = !isOpen;
	}

	function handleTriggerKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			isOpen = true;
			return;
		}

		if (event.key === 'Escape' && isOpen) {
			event.preventDefault();
			closePicker();
		}
	}
</script>

<div use:dismissibleMenu={{ open: isOpen, close: closePicker, trigger: triggerElement }} class="relative w-full">
	<button
		bind:this={triggerElement}
		type="button"
		aria-haspopup="dialog"
		aria-expanded={isOpen}
		class={triggerClass}
		onclick={togglePicker}
		onkeydown={handleTriggerKeydown}
	>
		<span class={summaryClass}>{summary}</span>
		<ChevronDown
			class={cn('size-3.5 shrink-0 text-zinc-400 transition-transform', isOpen && 'rotate-180')}
		/>
	</button>

	{#if isOpen}
		<div class="app-layer-floating absolute top-full left-0 right-0 mt-2">
			<IndustryPickerPanel
				options={options}
				selectedValues={[selectedValue]}
				{onSelect}
				onRequestClose={closePicker}
				{searchLabel}
				{searchPlaceholder}
				{emptyLabel}
			/>
		</div>
	{/if}
</div>
