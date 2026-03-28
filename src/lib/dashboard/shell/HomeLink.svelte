<script lang="ts">
	import { resolve } from '$app/paths';
	import {
		DEFAULT_NEW_BUSINESS_VIEW,
		resolveNewBusinessListPath
	} from '$lib/dashboard/routing/new-business';

	type Props = {
		onclick?: (event: MouseEvent) => void;
		class?: string;
	};

	let { onclick, class: className = '' }: Props = $props();
</script>

<a
	href={resolve(resolveNewBusinessListPath(DEFAULT_NEW_BUSINESS_VIEW))}
	aria-label="Go to new business"
	class={`overflow-hidden rounded-sm ${className}`}
	{onclick}
>
	<img src="/logo.png" alt="Logo" class="size-6 shrink-0" />
</a>
