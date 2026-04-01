<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ChevronLeft, ChevronRight, Info } from 'lucide-svelte';
	import DashboardTableShell from '$lib/dashboard/ui/table/DashboardTableShell.svelte';
	import { cn } from '$lib/support/cn';

	const PAGE_SIZE = 8;

	type Props = {
		rows: readonly unknown[];
		headers: readonly string[];
		columnClass: string;
		minWidthClass: string;
		ariaLabel: string;
		infoText?: string | null;
		infoContent?: Snippet;
		footer?: Snippet<[readonly unknown[]]>;
		dataAttribute?: string;
		interactiveRows?: boolean;
		emptyText?: string;
		class?: string;
		headerLeading?: Snippet<[readonly unknown[]]>;
		body: Snippet<[readonly unknown[]]>;
	};

	let {
		rows,
		headers,
		columnClass,
		minWidthClass,
		ariaLabel,
		infoText,
		infoContent,
		footer,
		dataAttribute,
		interactiveRows = true,
		emptyText = 'No rows available.',
		class: classProp = '',
		headerLeading,
		body
	}: Props = $props();

	let pageIndex = $state(0);
	let previousRows: readonly unknown[] | null = null;

	$effect(() => {
		if (previousRows === rows) {
			return;
		}

		previousRows = rows;
		pageIndex = 0;
	});

	const pageStart = $derived(pageIndex * PAGE_SIZE);
	const visibleRows = $derived(rows.slice(pageStart, pageStart + PAGE_SIZE));
	const hasPreviousPage = $derived(pageIndex > 0);
	const hasNextPage = $derived((pageIndex + 1) * PAGE_SIZE < rows.length);
	const hasFooterContent = $derived(Boolean(footer || infoContent || infoText?.trim()));
	const rangeLabel = $derived.by(() => {
		if (rows.length === 0) {
			return '0-0 of 0';
		}

		return `${pageStart + 1}-${Math.min(pageStart + PAGE_SIZE, rows.length)} of ${rows.length}`;
	});

	function showPreviousPage() {
		if (!hasPreviousPage) {
			return;
		}

		pageIndex -= 1;
	}

	function showNextPage() {
		if (!hasNextPage) {
			return;
		}

		pageIndex += 1;
	}
</script>

{#snippet shellHeaderLeading()}
	{#if headerLeading}
		{@render headerLeading(visibleRows)}
	{/if}
{/snippet}

{#snippet shellBody()}
	{@render body(visibleRows)}
{/snippet}

<div class={classProp}>
	<div class="overflow-hidden rounded-sm border border-zinc-100 bg-white">
		<DashboardTableShell
			{headers}
			{columnClass}
			{minWidthClass}
			{ariaLabel}
			rowsLength={rows.length}
			{interactiveRows}
			{emptyText}
			bordered={false}
			headerLeading={headerLeading ? shellHeaderLeading : undefined}
			body={shellBody}
		/>

		{#if rows.length > 0}
			<div
				class={cn(
					'border-t border-zinc-100 bg-zinc-50/35 px-3 py-2 text-zinc-500',
					hasFooterContent
						? 'flex items-center justify-between gap-3'
						: 'flex items-center justify-end gap-2'
				)}
				data-table-footer
				{...(dataAttribute ? { [dataAttribute]: true } : {})}
			>
				{#if footer}
					<div class="min-w-0">
						{@render footer(visibleRows)}
					</div>
				{:else if infoContent || infoText?.trim()}
					<div class="flex min-w-0 items-start gap-2">
						<Info aria-hidden="true" class="mt-0.5 size-3.5 shrink-0" />
						<p class="min-w-0 text-xs leading-relaxed tracking-wide">
							{#if infoContent}
								{@render infoContent()}
							{:else}
								{infoText}
							{/if}
						</p>
					</div>
				{/if}
				<div class="ml-2 flex shrink-0 items-center gap-2">
					<span class="text-xs tracking-wide">{rangeLabel}</span>
					<div class="flex items-center gap-1">
						<button
							type="button"
							class="inline-flex size-6 items-center justify-center rounded-sm text-zinc-300 transition-colors enabled:text-zinc-500 enabled:hover:text-zinc-700 disabled:cursor-default"
							aria-label="Previous table page"
							disabled={!hasPreviousPage}
							onclick={showPreviousPage}
						>
							<ChevronLeft aria-hidden="true" class="size-4" />
						</button>
						<button
							type="button"
							class="inline-flex size-6 items-center justify-center rounded-sm text-zinc-300 transition-colors enabled:text-zinc-500 enabled:hover:text-zinc-700 disabled:cursor-default"
							aria-label="Next table page"
							disabled={!hasNextPage}
							onclick={showNextPage}
						>
							<ChevronRight aria-hidden="true" class="size-4" />
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
