<script lang="ts">
	import { resolve } from '$app/paths';
	import type { DashboardShellReadModel } from '$lib/dashboard/read-models';
	import {
		DEFAULT_NEW_BUSINESS_VIEW,
		resolveNewBusinessListPath
	} from '$lib/dashboard/routing/new-business';

	type Props = {
		logoUrl: DashboardShellReadModel['branding']['logoUrl'];
		logoAlt: DashboardShellReadModel['branding']['logoAlt'];
		onclick?: (event: MouseEvent) => void;
		class?: string;
	};

	let { logoUrl, logoAlt, onclick, class: className = '' }: Props = $props();
</script>

<a
	href={resolve(resolveNewBusinessListPath(DEFAULT_NEW_BUSINESS_VIEW))}
	aria-label="Go to new business"
	class={`overflow-hidden rounded-sm ${className}`}
	{onclick}
>
	<img src={logoUrl} alt={logoAlt} class="size-6 shrink-0" />
</a>
