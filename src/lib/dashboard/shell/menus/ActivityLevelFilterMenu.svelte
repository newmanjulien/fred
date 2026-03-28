<script lang="ts">
	import { ListFilter } from 'lucide-svelte';
	import {
		getActivityLevelIconVariant,
		getActivityLevelLabel
	} from '$lib/dashboard/view-models/deal';
	import ActivityLevelGridIcon from '$lib/dashboard/ui/activity-level/ActivityLevelGridIcon.svelte';
	import SelectableIconRow from '$lib/dashboard/ui/shared/SelectableIconRow.svelte';
	import { ACTIVITY_LEVELS, type ActivityLevel } from '$lib/types/vocab';
	import DashboardMenuPanel from './DashboardMenuPanel.svelte';
	import { dismissibleMenu } from './menu-interactions';
	import { useDashboardMenu } from './menu-state.svelte';

	type Props = {
		menuId: string;
	};

	let { menuId }: Props = $props();
	const menu = useDashboardMenu(() => menuId);
	let selectedLevels = $state<ActivityLevel[]>([...ACTIVITY_LEVELS]);

	function toggleSelectedLevel(selectedLevel: ActivityLevel, checked: boolean) {
		const hasLevel = selectedLevels.includes(selectedLevel);

		if (checked && !hasLevel) {
			selectedLevels = [...selectedLevels, selectedLevel];
			return;
		}

		if (!checked && hasLevel) {
			selectedLevels = selectedLevels.filter((level) => level !== selectedLevel);
		}
	}

	function isSelected(level: ActivityLevel) {
		return selectedLevels.includes(level);
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
		Filter activity level
	</button>

	{#if menu.isOpen}
		<DashboardMenuPanel
			panelId={menu.panelId}
			class={menu.menuPanelClass}
			title="Filter by activity level"
		>
			{#snippet body()}
				<ul class="mt-1 space-y-1">
					{#each ACTIVITY_LEVELS as activityLevel (activityLevel)}
						{@const selected = isSelected(activityLevel)}
						<li>
							<SelectableIconRow
								label={getActivityLevelLabel(activityLevel)}
								selected={selected}
								role="menuitemcheckbox"
								ariaChecked={selected}
								onClick={() => toggleSelectedLevel(activityLevel, !selected)}
							>
								{#snippet leading()}
									<ActivityLevelGridIcon
										variant={getActivityLevelIconVariant(activityLevel)}
										class="size-3 text-zinc-400"
									/>
								{/snippet}
							</SelectableIconRow>
						</li>
					{/each}
				</ul>
			{/snippet}
		</DashboardMenuPanel>
	{/if}
</div>
