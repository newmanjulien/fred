<script lang="ts">
	import { cn } from '$lib/support/cn';
	import PersonAvatar from '$lib/dashboard/ui/people/PersonAvatar.svelte';

	type PersonInlinePerson = {
		name: string;
		avatar: string;
	};

	type Props = {
		person: PersonInlinePerson;
		avatarSize?: number;
		truncate?: boolean;
		class?: string;
	};

	let {
		person,
		avatarSize = 20,
		truncate = false,
		class: classProp = ''
	}: Props = $props();
</script>

<span class={cn('flex min-w-0 items-center gap-1.5', classProp)}>
	<PersonAvatar person={person} size={avatarSize} />
	<span class={cn('leading-none text-current', truncate && 'min-w-0 truncate')}>
		{person.name}
	</span>
</span>
