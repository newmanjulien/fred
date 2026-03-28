<script lang="ts">
	import SearchableFilterPanel from '$lib/dashboard/ui/pickers/SearchableFilterPanel.svelte';
	import type { SearchableFilterPanelOption } from '$lib/dashboard/ui/pickers/filter-panel';
	import SelectableAvatarRow from '$lib/dashboard/ui/shared/SelectableAvatarRow.svelte';

	export type BrokerPickerOption<TKey extends string = string> = SearchableFilterPanelOption<TKey> & {
		avatar: string;
	};

	type Props = {
		mode?: 'single' | 'multiple';
		surface?: 'embedded' | 'raised';
		options: readonly BrokerPickerOption[];
		selectedValues?: readonly string[];
		onSelect: (brokerKey: string) => void;
		onRequestClose?: () => void;
		searchLabel?: string;
		searchPlaceholder?: string;
		emptyLabel?: string;
		listClass?: string;
	};

	let {
		mode = 'single',
		surface = 'embedded',
		options,
		selectedValues = [],
		onSelect,
		onRequestClose,
		searchLabel = 'Search brokers',
		searchPlaceholder = 'Search brokers',
		emptyLabel = 'No brokers found',
		listClass
	}: Props = $props();
</script>

{#snippet brokerOptionRow(
	option: SearchableFilterPanelOption,
	state: {
		selected: boolean;
		highlighted: boolean;
		onClick: () => void;
		onMouseEnter: () => void;
	}
)}
	<SelectableAvatarRow
		label={option.label}
		avatar={option.avatar as string}
		selected={state.selected}
		highlighted={state.highlighted}
		ariaPressed={mode === 'multiple' ? state.selected : undefined}
		weight={mode === 'single' ? 'medium' : 'normal'}
		onClick={state.onClick}
		onMouseEnter={state.onMouseEnter}
	/>
{/snippet}

<SearchableFilterPanel
	{mode}
	{surface}
	{options}
	{selectedValues}
	onSelect={onSelect}
	{onRequestClose}
	{searchLabel}
	{searchPlaceholder}
	{emptyLabel}
	listClass={listClass ?? (mode === 'multiple' ? 'max-h-40' : 'max-h-56')}
	optionRow={brokerOptionRow}
/>
