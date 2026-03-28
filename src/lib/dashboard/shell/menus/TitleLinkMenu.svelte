<script lang="ts">
	import { resolve } from '$app/paths';
	import { resolveMyDealsListPath } from '$lib/dashboard/routing/my-deals';
	import { resolveNewBusinessListPath } from '$lib/dashboard/routing/new-business';
	import type { DashboardHeaderTitleMenu } from '$lib/dashboard/shell/header/types';
	import { cn } from '$lib/support/cn';
	import DashboardMenuPanel from './DashboardMenuPanel.svelte';
	import {
		type DashboardMenuPlacement,
		dismissibleMenu
	} from './menu-interactions';
	import { useDashboardMenu } from './menu-state.svelte';

	const BASE_TRIGGER_CLASS =
		'inline-flex items-center text-xs font-medium tracking-wide transition-colors';

	type Props = {
		menu: DashboardHeaderTitleMenu;
		placement?: DashboardMenuPlacement;
		class?: string;
	};

	let { menu, placement = 'bottom-start', class: classProp = '' }: Props = $props();
	const menuState = useDashboardMenu(
		() => menu.menuId,
		() => placement
	);
	const triggerClass = $derived(
		classProp ? `${BASE_TRIGGER_CLASS} ${classProp}` : BASE_TRIGGER_CLASS
	);
</script>

<div
	use:dismissibleMenu={{
		open: menuState.isOpen,
		close: menuState.close,
		trigger: menuState.triggerElement
	}}
	class="relative inline-flex shrink-0"
>
	<button
		bind:this={menuState.triggerElement}
		type="button"
		aria-haspopup="menu"
		aria-expanded={menuState.isOpen}
		aria-controls={menuState.isOpen ? menuState.panelId : undefined}
		aria-label={menu.ariaLabel}
		class={triggerClass}
		onclick={menuState.toggle}
	>
		<span>{menu.activeLabel}</span>
	</button>

	{#if menuState.isOpen}
		<DashboardMenuPanel
			panelId={menuState.panelId}
			class={menuState.menuPanelClass}
			title={menu.sectionLabel}
		>
			{#snippet body()}
				<ul class="mt-1 space-y-1">
					{#if menu.pageKind === 'my-deals'}
						{#each menu.options as option (option.id)}
							<li>
								<a
									href={resolve(resolveMyDealsListPath(option.id))}
									role="menuitemradio"
									aria-checked={option.current}
									aria-current={option.current ? 'page' : undefined}
									class={cn(
										'flex w-full items-center rounded-md px-3 py-2 text-left text-xs transition-colors hover:bg-zinc-100',
										option.current ? 'bg-zinc-50 text-zinc-900' : 'text-zinc-700'
									)}
									onclick={menuState.close}
								>
									<span>{option.label}</span>
								</a>
							</li>
						{/each}
					{:else}
						{#each menu.options as option (option.id)}
							<li>
								<a
									href={resolve(resolveNewBusinessListPath(option.id))}
									role="menuitemradio"
									aria-checked={option.current}
									aria-current={option.current ? 'page' : undefined}
									class={cn(
										'flex w-full items-center rounded-md px-3 py-2 text-left text-xs transition-colors hover:bg-zinc-100',
										option.current ? 'bg-zinc-50 text-zinc-900' : 'text-zinc-700'
									)}
									onclick={menuState.close}
								>
									<span>{option.label}</span>
								</a>
							</li>
						{/each}
					{/if}
				</ul>
			{/snippet}
		</DashboardMenuPanel>
	{/if}
</div>
