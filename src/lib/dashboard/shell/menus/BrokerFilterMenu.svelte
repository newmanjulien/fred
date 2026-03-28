<script lang="ts">
	import { ListFilter } from 'lucide-svelte';
	import BrokerPickerPanel from '$lib/dashboard/ui/pickers/BrokerPickerPanel.svelte';
	import { toBrokerPickerOptions } from '$lib/dashboard/ui/pickers/broker-picker-options';
	import SearchableMenuSurface from './SearchableMenuSurface.svelte';
	import { dismissibleMenu } from './menu-interactions';
	import { useDashboardMenu } from './menu-state.svelte';

	type BrokerFilterPerson = {
		key: string;
		name: string;
		avatar: string;
	};

	type Props = {
		menuId: string;
		people: BrokerFilterPerson[];
	};

	let { menuId, people }: Props = $props();
	const menu = useDashboardMenu(() => menuId);

	const allPersonKeys = $derived(people.map((person) => person.key));
	let selectedIds = $state<string[]>([]);

	$effect(() => {
		if (selectedIds.length === 0) {
			selectedIds = [...allPersonKeys];
		}
	});

	function toggleSelectedId(selectedId: string, checked: boolean) {
		const hasId = selectedIds.includes(selectedId);

		if (checked && !hasId) {
			selectedIds = [...selectedIds, selectedId];
			return;
		}

		if (!checked && hasId) {
			selectedIds = selectedIds.filter((id) => id !== selectedId);
		}
	}

	function isSelected(personId: string) {
		return selectedIds.includes(personId);
	}
</script>

<div
	use:dismissibleMenu={{ open: menu.isOpen, close: menu.close, trigger: menu.triggerElement }}
	class="relative inline-flex shrink-0"
>
	<button
		bind:this={menu.triggerElement}
		type="button"
		aria-haspopup="menu"
		aria-expanded={menu.isOpen}
		aria-controls={menu.isOpen ? menu.panelId : undefined}
		class="flex h-7 items-center justify-center gap-1.5 rounded-sm border border-zinc-100 px-2 text-xs font-medium tracking-wide text-zinc-500 transition-colors hover:bg-zinc-100"
		onclick={menu.toggle}
	>
		<ListFilter class="size-3.5" />
		Filter brokers
	</button>

	{#if menu.isOpen}
		<SearchableMenuSurface panelId={menu.panelId} class={menu.menuSurfaceClass}>
			<BrokerPickerPanel
				mode="multiple"
				surface="raised"
				options={toBrokerPickerOptions(people)}
				selectedValues={selectedIds}
				onSelect={(brokerKey) => toggleSelectedId(brokerKey, !isSelected(brokerKey))}
			/>
		</SearchableMenuSurface>
	{/if}
</div>
