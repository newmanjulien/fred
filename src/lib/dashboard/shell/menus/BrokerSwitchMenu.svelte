<script lang="ts">
	import BrokerPickerPanel from '$lib/dashboard/ui/pickers/BrokerPickerPanel.svelte';
	import { toBrokerPickerOptions } from '$lib/dashboard/ui/pickers/broker-picker-options';
	import SearchableMenuSurface from './SearchableMenuSurface.svelte';
	import { dismissibleMenu } from './menu-interactions';
	import { useDashboardMenu } from './menu-state.svelte';

	type BrokerMenuPerson = {
		key: string;
		name: string;
		avatar: string;
	};

	type Props = {
		menuId: string;
		people: readonly BrokerMenuPerson[];
		triggerLabel?: string;
	};

	let { menuId, people, triggerLabel = 'Switch' }: Props = $props();
	const menu = useDashboardMenu(() => menuId);
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
		class="mr-2 flex h-7 items-center justify-center rounded-sm border border-zinc-100 px-2 text-xs font-medium tracking-wide text-zinc-500 transition-colors hover:bg-zinc-100"
		onclick={menu.toggle}
	>
		{triggerLabel}
	</button>

	{#if menu.isOpen}
		<SearchableMenuSurface panelId={menu.panelId} class={menu.menuSurfaceClass}>
			<BrokerPickerPanel
				surface="raised"
				options={toBrokerPickerOptions(people)}
				onSelect={() => menu.close()}
				onRequestClose={menu.close}
			/>
		</SearchableMenuSurface>
	{/if}
</div>
