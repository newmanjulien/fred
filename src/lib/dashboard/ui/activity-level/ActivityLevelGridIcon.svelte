<script lang="ts">
	export type ActivityLevelGridVariant = 'full-grid' | 'half-grid' | 'quarter-grid';

	type Props = {
		variant: ActivityLevelGridVariant;
		class?: string;
	};

	let { variant, class: classProp = '' }: Props = $props();

	const GRID_CELLS: Array<[row: number, column: number]> = [
		[0, 0],
		[0, 1],
		[0, 2],
		[1, 0],
		[1, 1],
		[1, 2],
		[2, 0],
		[2, 1],
		[2, 2]
	];

	const ACTIVE_CELL_KEYS: Record<ActivityLevelGridVariant, Set<string>> = {
		'full-grid': new Set(GRID_CELLS.map(([row, column]) => `${row}:${column}`)),
		'half-grid': new Set(['2:0', '2:1', '2:2', '1:1', '1:2']),
		'quarter-grid': new Set(['2:0', '2:1', '2:2'])
	};
</script>

<svg
	viewBox="0 0 12 12"
	fill="none"
	aria-hidden="true"
	class={classProp ? `shrink-0 ${classProp}` : 'shrink-0'}
>
	{#each GRID_CELLS as [row, column] (`${row}:${column}`)}
		{@const cellKey = `${row}:${column}`}
		{@const isActive = ACTIVE_CELL_KEYS[variant].has(cellKey)}
		<rect
			x={1 + column * 4}
			y={1 + row * 4}
			width={2}
			height={2}
			rx={0.4}
			fill="currentColor"
			opacity={isActive ? 1 : 0.25}
		/>
	{/each}
</svg>
