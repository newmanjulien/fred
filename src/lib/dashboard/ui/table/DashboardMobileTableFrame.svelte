<script lang="ts">
	import type { Snippet } from 'svelte';
	import InlineInfoBar from '$lib/dashboard/ui/shared/InlineInfoBar.svelte';
	import DashboardTableShell from '$lib/dashboard/ui/table/DashboardTableShell.svelte';

	const BATCH_SIZE = 8;

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

	let visibleCount = $state(BATCH_SIZE);
	let loadTrigger = $state<HTMLDivElement | null>(null);
	let previousRows: readonly unknown[] | null = null;

	$effect(() => {
		if (previousRows === rows) {
			return;
		}

		previousRows = rows;
		visibleCount = BATCH_SIZE;
	});

	const visibleRows = $derived(rows.slice(0, visibleCount));
	const hasMoreRows = $derived(visibleCount < rows.length);

	$effect(() => {
		if (!loadTrigger || !hasMoreRows) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				if (!entries.some((entry) => entry.isIntersecting)) {
					return;
				}

				visibleCount = Math.min(rows.length, visibleCount + BATCH_SIZE);
			},
			{
				rootMargin: '160px 0px'
			}
		);

		observer.observe(loadTrigger);

		return () => {
			observer.disconnect();
		};
	});
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
	<DashboardTableShell
		{headers}
		{columnClass}
		{minWidthClass}
		{ariaLabel}
		rowsLength={rows.length}
		{interactiveRows}
		{emptyText}
		headerLeading={headerLeading ? shellHeaderLeading : undefined}
		body={shellBody}
	/>

	{#if rows.length > 0}
		<InlineInfoBar text={infoText} dataAttribute={dataAttribute} />
		{#if hasMoreRows}
			<div bind:this={loadTrigger} aria-hidden="true" class="h-4"></div>
		{/if}
	{/if}
</div>
