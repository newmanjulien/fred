<script lang="ts">
	import { cn } from '$lib/support/cn';

	type PersonAvatarPerson = {
		name: string;
		avatar: string;
	};

	type Props = {
		person: PersonAvatarPerson;
		size?: number;
		class?: string;
	};

	let { person, size = 20, class: classProp = '' }: Props = $props();
	let showImage = $derived(Boolean(person.avatar));
</script>

<span
	class={cn(
		'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-100 text-[10px] font-medium text-zinc-500',
		classProp
	)}
	style={`width:${size}px;height:${size}px;`}
>
	{#if showImage}
		<img
			src={person.avatar}
			alt={`${person.name} avatar`}
			class="block h-full w-full object-cover"
			onerror={() => {
				showImage = false;
			}}
		/>
	{:else}
		<span aria-hidden="true">{person.name.slice(0, 1)}</span>
	{/if}
</span>
