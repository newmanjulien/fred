<script lang="ts">
	import { Plus } from 'lucide-svelte';
	import AvatarStack from '$lib/dashboard/ui/people/AvatarStack.svelte';
	import SelectableAvatarRow from '$lib/dashboard/ui/shared/SelectableAvatarRow.svelte';
	import DashboardMenuPanel from './DashboardMenuPanel.svelte';
	import { dismissibleMenu } from './menu-interactions';
	import { useDashboardMenu } from './menu-state.svelte';

	type ShareMenuPerson = {
		key: string;
		name: string;
		avatar: string;
	};

	type Props = {
		menuId: string;
		people: readonly ShareMenuPerson[];
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

	const selectedPeople = $derived(people.filter((person) => selectedIds.includes(person.key)));

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

<div class="mr-2 flex items-center">
	<div class="flex items-center -space-x-1">
		<AvatarStack
			avatars={selectedPeople.map((person) => person.avatar)}
			altBase="Selected teammate"
			size={28}
			avatarClass="border-2 border-white"
		/>

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
				class="relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[1.5px] border-dotted border-zinc-300 bg-white text-zinc-400 ring-1 ring-white transition-colors hover:bg-zinc-100"
				onclick={menu.toggle}
			>
				<Plus class="h-3 w-3" />
			</button>

			{#if menu.isOpen}
				<DashboardMenuPanel
					panelId={menu.panelId}
					class={menu.menuPanelClass}
					title="Share with team members"
				>
					{#snippet body()}
						<ul class="mt-1 space-y-1">
							{#each people as person (person.key)}
								{@const selected = isSelected(person.key)}
								<li>
									<SelectableAvatarRow
										label={person.name}
										avatar={person.avatar}
										selected={selected}
										role="menuitemcheckbox"
										ariaChecked={selected}
										onClick={() => toggleSelectedId(person.key, !selected)}
									/>
								</li>
							{/each}
						</ul>
					{/snippet}
				</DashboardMenuPanel>
			{/if}
		</div>
	</div>
</div>
