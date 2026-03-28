<script lang="ts">
	import { Check } from 'lucide-svelte';
	import { cn } from '$lib/support/cn';

	type Props = {
		label: string;
		avatar: string;
		selected?: boolean;
		highlighted?: boolean;
		role?: 'menuitemcheckbox' | 'menuitem' | undefined;
		ariaChecked?: boolean | undefined;
		ariaPressed?: boolean | undefined;
		weight?: 'normal' | 'medium';
		onClick: () => void;
		onMouseEnter?: () => void;
	};

	let {
		label,
		avatar,
		selected = false,
		highlighted = false,
		role,
		ariaChecked,
		ariaPressed,
		weight = 'normal',
		onClick,
		onMouseEnter
	}: Props = $props();
</script>

<button
	type="button"
	{role}
	aria-checked={ariaChecked}
	aria-pressed={ariaPressed}
	class={cn(
		'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors hover:bg-zinc-100',
		selected ? 'bg-zinc-50 text-zinc-900' : 'text-zinc-700',
		highlighted && 'bg-zinc-100 text-zinc-900'
	)}
	onmouseenter={onMouseEnter}
	onclick={onClick}
>
	<div class="flex min-w-0 items-center gap-2">
		<span class="inline-flex h-7 w-7 shrink-0 overflow-hidden rounded-full border border-zinc-200">
			<img src={avatar} alt={`${label} avatar`} class="h-full w-full object-cover" />
		</span>
		<span class={cn('truncate', weight === 'medium' && 'font-medium')}>{label}</span>
	</div>
	{#if role === 'menuitem' && !ariaChecked && !ariaPressed}
		<span class="sr-only">{label}</span>
	{:else}
		<Check class={cn('ml-3 size-3.5 shrink-0 text-zinc-400', selected ? 'opacity-100' : 'opacity-0')} />
	{/if}
</button>
