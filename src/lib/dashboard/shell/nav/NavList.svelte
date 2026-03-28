<script lang="ts">
	import { resolve } from '$app/paths';
	import { fly } from 'svelte/transition';
	import { isDashboardNavRouteActive, type DashboardRouteRef } from '$lib/dashboard/routing';
	import { resolveMyDealsListPath } from '$lib/dashboard/routing/my-deals';
	import { resolveNewBusinessListPath } from '$lib/dashboard/routing/new-business';
	import { resolveOpportunitiesListPath } from '$lib/dashboard/routing/opportunities';
	import { resolveSinceLastMeetingPath } from '$lib/dashboard/routing/since-last-meeting';
	import { cn } from '$lib/support/cn';
	import type { DashboardNavRouteRef, DashboardNavSection, DashboardNavSectionId } from './model';

	type Props = {
		sections: readonly DashboardNavSection[];
		currentRoute: DashboardRouteRef;
		expanded: boolean;
		renderMode?: 'desktop' | 'mobile';
		onHoverRoute?: (route: DashboardNavRouteRef | null, sectionId: DashboardNavSectionId) => void;
		onSelectRoute?: (route: DashboardNavRouteRef) => void;
	};

	let {
		sections,
		currentRoute,
		expanded,
		renderMode = 'desktop',
		onHoverRoute,
		onSelectRoute
	}: Props = $props();

	function isBottomSection(sectionId: DashboardNavSectionId) {
		return sectionId === 'bottom';
	}

	function shouldShowCollapsedDivider(sectionIndex: number) {
		if (renderMode !== 'desktop' || expanded) return false;

		const section = sections[sectionIndex];
		const previousSection = sections[sectionIndex - 1];

		return Boolean(section?.showCollapsedDivider && previousSection?.items.length && section.items.length);
	}

	function getContainerClassName(sectionId: DashboardNavSectionId) {
		return cn(
			'relative',
			expanded ? 'block w-full' : 'inline-flex',
			renderMode === 'desktop' && isBottomSection(sectionId) && !expanded && 'self-center'
		);
	}

	function getItemClassName(params: {
		sectionId: DashboardNavSectionId;
		isActive: boolean;
		disabled?: boolean;
	}) {
		const { sectionId, isActive, disabled = false } = params;
		const isBottom = isBottomSection(sectionId);

		if (renderMode === 'mobile') {
			return cn(
				'inline-flex h-10 w-full items-center justify-start gap-2.5 rounded-md px-2 text-xs tracking-wide text-zinc-600 transition-colors hover:bg-zinc-100/70 hover:text-zinc-900',
				disabled && 'pointer-events-none opacity-40',
				isActive && 'bg-zinc-100/70 text-zinc-900'
			);
		}

		return cn(
			'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm tracking-wide transition-colors',
			expanded
				? 'h-7 w-full justify-start gap-2.5 rounded-sm border border-transparent px-2 text-xs text-zinc-600 hover:bg-transparent hover:text-zinc-800'
				: isBottom
					? 'size-7 justify-center rounded-full border border-zinc-100 bg-white text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700'
					: 'size-7 justify-center rounded-sm border border-transparent text-zinc-500 hover:bg-transparent hover:text-zinc-800',
			disabled && 'pointer-events-none opacity-50',
			isActive &&
				(expanded
					? 'text-zinc-900'
					: isBottom
						? 'border-zinc-300 bg-white text-zinc-900'
						: 'text-zinc-900')
		);
	}
</script>

{#each sections as section, sectionIndex (section.id)}
	<div
		class={cn(
			'flex flex-col',
			(renderMode === 'mobile' || expanded || section.id === 'bottom') &&
				(renderMode === 'mobile' ? section.mobileSectionClass : section.desktopSectionClass),
			section.id === 'bottom' && (renderMode === 'mobile' ? 'mt-auto' : 'mt-auto pb-1')
		)}
	>
		{#if section.heading && (renderMode === 'mobile' || expanded)}
			<div class={renderMode === 'mobile' ? '' : 'mb-2'} in:fly={{ x: -4, duration: 200 }}>
				<p class={renderMode === 'mobile'
					? 'px-2 pb-2 text-[11px] uppercase tracking-wide text-zinc-400'
					: 'px-2 text-[11px] uppercase tracking-wide text-zinc-400'}>
					{section.heading}
				</p>
			</div>
		{:else if shouldShowCollapsedDivider(sectionIndex)}
			<div class="py-3">
				<span aria-hidden="true" class="mx-auto block h-px w-4 bg-zinc-200/50"></span>
			</div>
		{/if}

		<ul class={renderMode === 'mobile' ? 'flex flex-col gap-1.5' : 'flex flex-col gap-1.5'}>
			{#each section.items as item (item.kind === 'route' ? item.route.kind : `${section.id}:${item.label}`)}
				{@const Icon = item.icon}
				<li>
					<span class={getContainerClassName(section.id)}>
						{#if item.kind === 'disabled'}
							<span class={getItemClassName({ sectionId: section.id, isActive: false, disabled: true })}>
								<Icon class="size-3.5 shrink-0" />
								{#if renderMode === 'mobile' || expanded}
									<span class={renderMode === 'mobile' ? 'min-w-0 truncate' : 'min-w-0 overflow-hidden'}>
										{#if renderMode === 'mobile'}
											{item.label}
										{:else}
											<span class="block truncate text-left">{item.label}</span>
										{/if}
									</span>
								{:else}
									<span class="sr-only">{item.label}</span>
								{/if}
							</span>
						{:else}
							{#if item.route.kind === 'my-deals-list'}
								<a
									href={resolve(resolveMyDealsListPath(item.route.view))}
									data-sidebar-indicator-key={renderMode === 'desktop' ? item.route.kind : undefined}
									class={getItemClassName({
										sectionId: section.id,
										isActive: isDashboardNavRouteActive(item.route, currentRoute)
									})}
									onmouseenter={() => {
										onHoverRoute?.(item.route, section.id);
									}}
									onclick={() => {
										onSelectRoute?.(item.route);
									}}
								>
									<Icon class="size-3.5 shrink-0" />
									{#if renderMode === 'mobile' || expanded}
										<span class={renderMode === 'mobile' ? 'min-w-0 truncate' : 'min-w-0 overflow-hidden'} in:fly={renderMode === 'mobile' ? undefined : { x: -4, duration: 200 }}>
											{#if renderMode === 'mobile'}
												{item.label}
											{:else}
												<span class="block truncate text-left">{item.label}</span>
											{/if}
										</span>
									{:else}
										<span class="sr-only">{item.label}</span>
									{/if}
								</a>
							{:else if item.route.kind === 'new-business-list'}
								<a
									href={resolve(resolveNewBusinessListPath(item.route.view))}
									data-sidebar-indicator-key={renderMode === 'desktop' ? item.route.kind : undefined}
									class={getItemClassName({
										sectionId: section.id,
										isActive: isDashboardNavRouteActive(item.route, currentRoute)
									})}
									onmouseenter={() => {
										onHoverRoute?.(item.route, section.id);
									}}
									onclick={() => {
										onSelectRoute?.(item.route);
									}}
								>
									<Icon class="size-3.5 shrink-0" />
									{#if renderMode === 'mobile' || expanded}
										<span class={renderMode === 'mobile' ? 'min-w-0 truncate' : 'min-w-0 overflow-hidden'} in:fly={renderMode === 'mobile' ? undefined : { x: -4, duration: 200 }}>
											{#if renderMode === 'mobile'}
												{item.label}
											{:else}
												<span class="block truncate text-left">{item.label}</span>
											{/if}
										</span>
									{:else}
										<span class="sr-only">{item.label}</span>
									{/if}
								</a>
							{:else if item.route.kind === 'opportunities-list'}
								<a
									href={resolve(resolveOpportunitiesListPath(item.route.meetingKey))}
									data-sidebar-indicator-key={renderMode === 'desktop' ? item.route.kind : undefined}
									class={getItemClassName({
										sectionId: section.id,
										isActive: isDashboardNavRouteActive(item.route, currentRoute)
									})}
									onmouseenter={() => {
										onHoverRoute?.(item.route, section.id);
									}}
									onclick={() => {
										onSelectRoute?.(item.route);
									}}
								>
									<Icon class="size-3.5 shrink-0" />
									{#if renderMode === 'mobile' || expanded}
										<span class={renderMode === 'mobile' ? 'min-w-0 truncate' : 'min-w-0 overflow-hidden'} in:fly={renderMode === 'mobile' ? undefined : { x: -4, duration: 200 }}>
											{#if renderMode === 'mobile'}
												{item.label}
											{:else}
												<span class="block truncate text-left">{item.label}</span>
											{/if}
										</span>
									{:else}
										<span class="sr-only">{item.label}</span>
									{/if}
								</a>
							{:else}
								<a
									href={resolve(resolveSinceLastMeetingPath(item.route.meetingKey))}
									data-sidebar-indicator-key={renderMode === 'desktop' ? item.route.kind : undefined}
									class={getItemClassName({
										sectionId: section.id,
										isActive: isDashboardNavRouteActive(item.route, currentRoute)
									})}
									onmouseenter={() => {
										onHoverRoute?.(item.route, section.id);
									}}
									onclick={() => {
										onSelectRoute?.(item.route);
									}}
								>
									<Icon class="size-3.5 shrink-0" />
									{#if renderMode === 'mobile' || expanded}
										<span class={renderMode === 'mobile' ? 'min-w-0 truncate' : 'min-w-0 overflow-hidden'} in:fly={renderMode === 'mobile' ? undefined : { x: -4, duration: 200 }}>
											{#if renderMode === 'mobile'}
												{item.label}
											{:else}
												<span class="block truncate text-left">{item.label}</span>
											{/if}
										</span>
									{:else}
										<span class="sr-only">{item.label}</span>
									{/if}
								</a>
							{/if}
						{/if}
					</span>
				</li>
			{/each}
		</ul>
	</div>
{/each}
