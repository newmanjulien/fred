<script lang="ts">
	import { X } from 'lucide-svelte';
	import { cubicOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { getDashboardDetailRailWidth } from '$lib/dashboard/layout/tokens';
	import ActivityLevelGridIcon from '$lib/dashboard/ui/activity-level/ActivityLevelGridIcon.svelte';
	import SearchableFilterPanel from '$lib/dashboard/ui/pickers/SearchableFilterPanel.svelte';
	import type { SearchableFilterPanelOption } from '$lib/dashboard/ui/pickers/filter-panel';
	import SelectableAvatarRow from '$lib/dashboard/ui/shared/SelectableAvatarRow.svelte';
	import SelectableIconRow from '$lib/dashboard/ui/shared/SelectableIconRow.svelte';
	import Section from './Section.svelte';
	import type {
		NewBusinessFilterOptionToggle,
		NewBusinessFilterSectionId
	} from './model';
	import type {
		NewBusinessBrokerFilterSection,
		NewBusinessFilterDrawerSection,
		NewBusinessIndustryFilterSection
	} from './sections';

	type Props = {
		open: boolean;
		sections: readonly NewBusinessFilterDrawerSection[];
		onClose: () => void;
		onToggleSection: (sectionId: NewBusinessFilterSectionId) => void;
		onToggleOption: (toggle: NewBusinessFilterOptionToggle) => void;
	};

	let {
		open,
		sections,
		onClose,
		onToggleSection,
		onToggleOption
	}: Props = $props();

	const drawerWidth = getDashboardDetailRailWidth('standard');

	function drawerSlide(node: Element, { delay = 0, duration = 240 } = {}) {
		return {
			delay,
			duration,
			easing: cubicOut,
			css: (t: number) => {
				const translateX = (1 - t) * 22;
				const opacity = 0.78 + t * 0.22;

				return `transform: translate3d(${translateX}px, 0, 0); opacity: ${opacity};`;
			}
		};
	}

	$effect(() => {
		if (!open) {
			return;
		}

		function handleDocumentKeydown(event: KeyboardEvent) {
			if (event.key !== 'Escape') {
				return;
			}

			event.preventDefault();
			onClose();
		}

		document.addEventListener('keydown', handleDocumentKeydown);

		return () => {
			document.removeEventListener('keydown', handleDocumentKeydown);
		};
	});
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
		ariaPressed={state.selected}
		onClick={state.onClick}
		onMouseEnter={state.onMouseEnter}
	/>
{/snippet}

{#if open}
	<div
		class="app-layer-drawer pointer-events-none absolute inset-0 hidden md:block"
		data-new-business-filter-drawer-root
	>
		<button
			type="button"
			aria-label="Close filters"
			class="pointer-events-auto absolute inset-0 bg-zinc-950/6"
			transition:fade={{ duration: 180 }}
			onclick={onClose}
		></button>

		<aside
			data-new-business-filter-drawer
			class="pointer-events-auto absolute inset-y-0 right-0 flex flex-col border-l border-zinc-100 bg-white shadow-[0_18px_60px_rgba(24,24,27,0.14)] will-change-transform"
			style={`width: ${drawerWidth};`}
			transition:drawerSlide
		>
			<header class="flex h-11 items-center border-b border-zinc-100 px-4">
				<h2 class="text-xs font-medium tracking-wide text-zinc-900">Filters</h2>
				<button
					type="button"
					aria-label="Close filters"
					class="ml-auto inline-flex size-8 items-center justify-center rounded-sm text-zinc-700 transition-colors hover:bg-zinc-100"
					onclick={onClose}
				>
					<X class="size-4" />
				</button>
			</header>

			<div class="min-h-0 flex-1 overflow-y-auto bg-white">
				{#each sections as section, sectionIndex (section.id)}
					{#if section.id !== 'activity-level'}
						<Section
							{section}
							showDivider={sectionIndex > 0}
							{onToggleSection}
						>
							{#if section.id === 'broker'}
								<SearchableFilterPanel
									mode="multiple"
									options={section.options}
									selectedValues={section.options
										.filter((option) => option.selected)
										.map((option) => option.id)}
									onSelect={(optionId) =>
										onToggleOption({
											sectionId: 'broker',
											optionId: optionId as NewBusinessBrokerFilterSection['options'][number]['id']
										})}
									searchLabel={section.searchLabel}
									searchPlaceholder={section.searchPlaceholder}
									emptyLabel={section.emptyLabel}
									listClass="max-h-40"
									optionRow={brokerOptionRow}
								/>
							{:else}
								<SearchableFilterPanel
									mode="multiple"
									options={section.options}
									selectedValues={section.options
										.filter((option) => option.selected)
										.map((option) => option.id)}
									onSelect={(optionId) =>
										onToggleOption({
											sectionId: 'industry',
											optionId: optionId as NewBusinessIndustryFilterSection['options'][number]['id']
										})}
									searchLabel={section.searchLabel}
									searchPlaceholder={section.searchPlaceholder}
									emptyLabel={section.emptyLabel}
									listClass="max-h-40"
								/>
							{/if}
						</Section>
					{:else}
						<Section
							{section}
							showDivider={sectionIndex > 0}
							{onToggleSection}
						>
							<ul class="space-y-1">
								{#each section.options as option (option.id)}
									<li>
										<SelectableIconRow
											label={option.label}
											selected={option.selected}
											ariaPressed={option.selected}
											onClick={() =>
												onToggleOption({
													sectionId: section.id,
													optionId: option.id
												})}
										>
											{#snippet leading()}
												<ActivityLevelGridIcon
													variant={option.iconVariant}
													class="size-3 text-zinc-400"
												/>
											{/snippet}
										</SelectableIconRow>
									</li>
								{/each}
							</ul>
						</Section>
					{/if}
				{/each}
			</div>
		</aside>
	</div>
{/if}
