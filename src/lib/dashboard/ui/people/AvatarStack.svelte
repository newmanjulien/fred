<script lang="ts">
	import { cn } from '$lib/support/cn';

	type Props = {
		avatars: readonly string[];
		altBase: string;
		size?: number;
		stackClass?: string;
		avatarClass?: string;
	};

	let {
		avatars,
		altBase,
		size = 20,
		stackClass = '-space-x-1',
		avatarClass = 'border border-white bg-zinc-50'
	}: Props = $props();
</script>

<div class={cn('flex items-center', stackClass)}>
	{#each avatars as avatar, index (`${avatar}:${index}`)}
		<span
			class={cn('inline-flex shrink-0 overflow-hidden rounded-full', avatarClass)}
			style={`width:${size}px;height:${size}px;`}
		>
			<img
				src={avatar}
				alt={`${altBase} avatar ${index + 1}`}
				class="h-full w-full object-cover"
			/>
		</span>
	{/each}
</div>
