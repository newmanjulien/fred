<script lang="ts">
	import { Check } from 'lucide-svelte';
	import type { Component, Snippet } from 'svelte';
	import { cn } from '$lib/support/cn';

	type Props = {
		label: string;
		selected?: boolean;
		role?: 'menuitemcheckbox' | undefined;
		ariaChecked?: boolean | undefined;
		ariaPressed?: boolean | undefined;
		icon?: Component;
		leading?: Snippet;
		iconClass?: string;
		onClick: () => void;
	};

	let {
		label,
		selected = false,
		role,
		ariaChecked,
		ariaPressed,
		icon: Icon,
		leading,
		iconClass = 'size-3 text-zinc-400',
		onClick
	}: Props = $props();
</script>

<button
	type="button"
	{role}
	aria-checked={ariaChecked}
	aria-pressed={ariaPressed}
	class={cn(
		'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors hover:bg-zinc-100',
		selected ? 'bg-zinc-50 text-zinc-900' : 'text-zinc-700'
	)}
	onclick={onClick}
>
	<div class="flex min-w-0 items-center gap-2">
		{#if leading}
			{@render leading()}
		{:else if Icon}
			<Icon class={iconClass} />
		{/if}
		<span class="truncate">{label}</span>
	</div>
	<Check class={cn('ml-3 size-3.5 shrink-0 text-zinc-400', selected ? 'opacity-100' : 'opacity-0')} />
</button>
