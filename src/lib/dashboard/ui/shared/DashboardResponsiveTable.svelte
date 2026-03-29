<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ChevronLeft, ChevronRight, Info } from 'lucide-svelte';
	import InlineInfoBar from '$lib/dashboard/ui/shared/InlineInfoBar.svelte';
	import DashboardTableShell from '$lib/dashboard/ui/shared/DashboardTableShell.svelte';
	import { cn } from '$lib/support/cn';

	const DESKTOP_PAGE_SIZE = 8;

	type Props = {
		rows: readonly unknown[];
		headers: readonly string[];
		columnClass: string;
		minWidthClass: string;
		ariaLabel: string;
		infoText?: string | null;
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
		dataAttribute,
		interactiveRows = true,
		emptyText = 'No rows available.',
		class: classProp = '',
		headerLeading,
		body
	}: Props = $props();

	let desktopPageIndex = $state(0);
	let previousRows: readonly unknown[] | null = null;

	$effect(() => {
		if (previousRows === rows) {
			return;
		}

		previousRows = rows;
		desktopPageIndex = 0;
	});

	const desktopPageStart = $derived(desktopPageIndex * DESKTOP_PAGE_SIZE);
	const visibleDesktopRows = $derived(
		rows.slice(desktopPageStart, desktopPageStart + DESKTOP_PAGE_SIZE)
	);
	const hasPreviousPage = $derived(desktopPageIndex > 0);
	const hasNextPage = $derived((desktopPageIndex + 1) * DESKTOP_PAGE_SIZE < rows.length);
	const rangeLabel = $derived.by(() => {
		if (rows.length === 0) {
			return '0-0 of 0';
		}

		return `${desktopPageStart + 1}-${Math.min(desktopPageStart + DESKTOP_PAGE_SIZE, rows.length)} of ${rows.length}`;
	});

	function showPreviousPage() {
		if (!hasPreviousPage) {
			return;
		}

		desktopPageIndex -= 1;
	}

	function showNextPage() {
		if (!hasNextPage) {
			return;
		}

		desktopPageIndex += 1;
	}
</script>

{#snippet shellHeaderLeading()}
	{#if headerLeading}
		{@render headerLeading(visibleDesktopRows)}
	{/if}
{/snippet}

{#snippet shellBody()}
	{@render body(visibleDesktopRows)}
{/snippet}

{#snippet mobileShellHeaderLeading()}
	{#if headerLeading}
		{@render headerLeading(rows)}
	{/if}
{/snippet}

{#snippet mobileShellBody()}
	{@render body(rows)}
{/snippet}

<div class={cn('hidden md:block', classProp)}>
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
					infoText?.trim()
						? 'flex items-center justify-between gap-3'
						: 'flex items-center justify-end gap-2'
				)}
				data-table-footer
				{...(dataAttribute ? { [dataAttribute]: true } : {})}
			>
				{#if infoText?.trim()}
					<div class="flex min-w-0 items-start gap-2">
						<Info aria-hidden="true" class="mt-0.5 size-3.5 shrink-0" />
						<p class="min-w-0 text-xs leading-relaxed tracking-wide">{infoText}</p>
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

<div class={cn('md:hidden', classProp)}>
	<DashboardTableShell
		{headers}
		{columnClass}
		{minWidthClass}
		{ariaLabel}
		rowsLength={rows.length}
		{interactiveRows}
		{emptyText}
		headerLeading={headerLeading ? mobileShellHeaderLeading : undefined}
		body={mobileShellBody}
	/>

	{#if rows.length > 0}
		<InlineInfoBar text={infoText} />
	{/if}
</div>
