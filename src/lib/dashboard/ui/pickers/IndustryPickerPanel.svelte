<script lang="ts">
	import SearchableFilterPanel from '$lib/dashboard/ui/pickers/SearchableFilterPanel.svelte';
	import type { SearchableFilterPanelOption } from '$lib/dashboard/ui/pickers/filter-panel';
	import type { DealIndustry } from '$lib/types/vocab';

	export type IndustryPickerOption = SearchableFilterPanelOption<DealIndustry>;

	type Props = {
		mode?: 'single' | 'multiple';
		options: readonly IndustryPickerOption[];
		selectedValues?: readonly DealIndustry[];
		onSelect: (industry: DealIndustry) => void;
		onRequestClose?: () => void;
		searchLabel?: string;
		searchPlaceholder?: string;
		emptyLabel?: string;
	};

	let {
		mode = 'single',
		options,
		selectedValues = [],
		onSelect,
		onRequestClose,
		searchLabel = 'Search industries',
		searchPlaceholder = 'Search industries',
		emptyLabel = 'No industries found'
	}: Props = $props();
</script>

<SearchableFilterPanel
	{mode}
	{options}
	selectedValues={selectedValues}
	onSelect={(optionId) => onSelect(optionId as DealIndustry)}
	{onRequestClose}
	{searchLabel}
	{searchPlaceholder}
	{emptyLabel}
/>
