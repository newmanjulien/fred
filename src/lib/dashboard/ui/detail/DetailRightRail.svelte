<script lang="ts">
	import type { DetailRightRailData } from '$lib/dashboard/detail/right-rail';
	import { formatDealNumber } from '$lib/dashboard/view-models/deal';
	import ActivityLevelLabel from '$lib/dashboard/ui/activity-level/ActivityLevelLabel.svelte';
	import DetailRightRailIndustryField from '$lib/dashboard/ui/detail/DetailRightRailIndustryField.svelte';
	import LinkedInGlyph from '$lib/dashboard/ui/icons/LinkedInGlyph.svelte';
	import PersonInline from '$lib/dashboard/ui/people/PersonInline.svelte';
	import ListCard from '$lib/dashboard/ui/shared/ListCard.svelte';
	import { parseAbsoluteUrl } from '$lib/types/url';

	type Props = {
		data: DetailRightRailData;
	};

	let { data }: Props = $props();
</script>

<div class="w-full bg-white">
	<div class="min-w-0">
		{#each data.sections as section (section.id)}
			{#if section.kind === 'rows'}
				<section class="border-t border-zinc-100 px-4 py-4 first:border-t-0">
					<div class="grid gap-4">
						{#each section.rows as row (row.id)}
							<div class="grid items-center grid-cols-[4.25rem_minmax(0,1fr)] gap-2.5">
								<p class="self-center text-[11px] leading-relaxed tracking-wide text-zinc-400">
									{row.label}
								</p>
								<div
									class="flex min-w-0 items-center text-[11px] leading-relaxed tracking-wide text-zinc-700"
								>
									{#if row.kind === 'activity-level'}
										<ActivityLevelLabel activityLevel={row.activityLevel} />
									{:else if row.kind === 'person'}
										{#if row.person}
											<PersonInline person={row.person} avatarSize={20} class="gap-2" />
										{:else}
											<span>{row.emptyValue ?? 'Unassigned'}</span>
										{/if}
									{:else if row.kind === 'deal-number'}
										<span>{formatDealNumber(row.dealNumber)}</span>
									{:else if row.kind === 'industry'}
										<DetailRightRailIndustryField dealKey={row.dealKey} industry={row.value} />
									{:else if row.kind === 'text'}
										<span>{row.value}</span>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</section>
			{:else if section.kind === 'helpful-contacts'}
				<section class="space-y-3 border-t border-zinc-100 px-4 py-4 first:border-t-0">
					<p class="text-[9px] uppercase tracking-[0.16em] text-zinc-400">{section.title}</p>
					<ol class="space-y-2.5">
						{#each section.contacts as contact (contact.id)}
							{@const linkedInHref = parseAbsoluteUrl(contact.linkedInUrl)}
							<li>
								<ListCard
									link={linkedInHref
										? {
												kind: 'external',
												href: linkedInHref,
												target: '_blank'
											}
										: {
												kind: 'none'
											}}
								>
									{#snippet body()}
										<div class="flex items-start gap-1.5">
											<LinkedInGlyph class="mt-0.5 size-3 shrink-0 text-zinc-500" />
											<div class="min-w-0">
												<h2 class="text-xs leading-snug tracking-wide text-zinc-800">
													{contact.name}
												</h2>
												<p class="mt-1 text-[11px] leading-relaxed tracking-wide text-zinc-500">
													{contact.title} at {contact.company}
												</p>
											</div>
										</div>
									{/snippet}
								</ListCard>
							</li>
						{/each}
					</ol>
				</section>
			{/if}
		{/each}
	</div>
</div>
