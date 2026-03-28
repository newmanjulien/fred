<script lang="ts">
	import { ChevronDown } from 'lucide-svelte';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/support/cn';
	import type { NewBusinessFilterSectionId } from './model';
	import type { NewBusinessFilterDrawerSection } from './sections';

	type Props = {
		section: NewBusinessFilterDrawerSection;
		showDivider?: boolean;
		onToggleSection: (sectionId: NewBusinessFilterSectionId) => void;
		children?: Snippet;
	};

	let {
		section,
		showDivider = false,
		onToggleSection,
		children
	}: Props = $props();
</script>

<section
	data-new-business-filter-section={section.id}
	class={cn(showDivider && 'border-t border-zinc-100', 'px-4 py-4')}
>
	{#if section.collapsible}
		<button
			type="button"
			class="flex w-full items-center gap-3 text-left"
			aria-expanded={section.expanded}
			onclick={() => onToggleSection(section.id)}
		>
			<div class="min-w-0 flex-1">
				<p class="text-[9px] uppercase tracking-[0.08em] text-zinc-400">{section.title}</p>
				<p
					data-new-business-filter-summary={section.id}
					class="mt-1 text-[11px] tracking-wide text-zinc-500"
				>
					{section.summary}
				</p>
			</div>
			<ChevronDown
				class={cn(
					'size-3.5 shrink-0 text-zinc-400 transition-transform',
					section.expanded && 'rotate-180'
				)}
			/>
		</button>
	{:else}
		<div class="flex w-full items-center gap-3 text-left">
			<div class="min-w-0 flex-1">
				<p class="text-[9px] uppercase tracking-[0.08em] text-zinc-400">{section.title}</p>
				<p
					data-new-business-filter-summary={section.id}
					class="mt-1 text-[11px] tracking-wide text-zinc-500"
				>
					{section.summary}
				</p>
			</div>
		</div>
	{/if}

	{#if section.expanded}
		<div class="mt-3 space-y-3">
			{#if children}
				{@render children()}
			{/if}
		</div>
	{/if}
</section>
