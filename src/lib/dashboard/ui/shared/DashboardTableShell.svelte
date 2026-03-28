<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/support/cn';

	type Props = {
		headers: readonly string[];
		columnClass: string;
		minWidthClass: string;
		ariaLabel: string;
		rowsLength: number;
		interactiveRows?: boolean;
		emptyText?: string;
		class?: string;
		headerLeading?: Snippet;
		body?: Snippet;
	};

	let {
		headers,
		columnClass,
		minWidthClass,
		ariaLabel,
		rowsLength,
		interactiveRows = true,
		emptyText = 'No rows available.',
		class: classProp = '',
		headerLeading,
		body
	}: Props = $props();
</script>

<div
	class={cn('dashboard-table-shell rounded-sm border border-zinc-100 bg-white', classProp)}
	data-interactive-rows={interactiveRows ? 'true' : 'false'}
>
	<div
		data-table-scroll
		class="overflow-x-auto overflow-y-hidden overscroll-x-contain"
		role="region"
		aria-label={ariaLabel}
	>
		<div class={cn('w-max min-w-full md:w-full', minWidthClass)}>
			<div
				data-table-header-row
				class={cn('grid border-b border-zinc-100 bg-zinc-50/80', columnClass)}
			>
				{#if headerLeading}
					{@render headerLeading()}
				{/if}
				{#each headers as header (header)}
					<span data-table-header-cell class="text-left font-normal text-zinc-500">
						{header}
					</span>
				{/each}
			</div>

			{#if rowsLength === 0}
				<div data-table-empty class="text-zinc-500">{emptyText}</div>
			{:else if body}
				{@render body()}
			{/if}
		</div>
	</div>
</div>
