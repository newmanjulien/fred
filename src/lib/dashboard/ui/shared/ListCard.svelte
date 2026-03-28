<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';
	import type { LinkTarget } from '$lib/dashboard/links';
	import { cn } from '$lib/support/cn';

	type Props = {
		link?: LinkTarget;
		class?: string;
		body?: Snippet;
	};

	let {
		link = { kind: 'none' },
		class: classProp = '',
		body
	}: Props = $props();

	const cardClass = $derived(
		cn('block rounded-md border border-zinc-100 px-3 py-3 transition-colors hover:bg-zinc-50', classProp)
	);

	function getExternalAnchorProps(link: Extract<LinkTarget, { kind: 'external' }>) {
		const relTokens = ['external', ...(link.rel?.split(/\s+/).filter(Boolean) ?? [])];

		if (link.target === '_blank') {
			relTokens.push('noopener', 'noreferrer');
		}

		const normalizedRelTokens = relTokens.filter(
			(token, index) => relTokens.indexOf(token) === index
		);

		return {
			...(link.target ? { target: link.target } : {}),
			...(normalizedRelTokens.length > 0 ? { rel: normalizedRelTokens.join(' ') } : {})
		};
	}
</script>

{#if link.kind === 'my-deals'}
	<a href={resolve(link.href)} class={cardClass}>
		{#if body}
			{@render body()}
		{/if}
	</a>
{:else if link.kind === 'opportunities'}
	<a href={resolve(link.href)} class={cardClass}>
		{#if body}
			{@render body()}
		{/if}
	</a>
{:else if link.kind === 'external'}
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
	<a href={link.href} {...getExternalAnchorProps(link)} class={cardClass}>
		{#if body}
			{@render body()}
		{/if}
	</a>
{:else}
	<div class={cardClass}>
		{#if body}
			{@render body()}
		{/if}
	</div>
{/if}
