import { getContext, setContext } from 'svelte';

const SECTION_TABS_CONTEXT_KEY = Symbol('section-tabs');

type SectionTabOption = {
	id: string;
};

export type SectionTabsContext = {
	matches(tabId: string): boolean;
};

export function resolveRequestedSectionTabId<T extends SectionTabOption>(
	selectableTabs: readonly T[],
	initialTabId?: string
) {
	return initialTabId && selectableTabs.some((tab) => tab.id === initialTabId) ? initialTabId : '';
}

export function resolveSelectedSectionTabId<T extends SectionTabOption>(input: {
	selectableTabs: readonly T[];
	requestedTabId: string;
	syncedRequestedTabId: string;
	activeTabId: string;
}) {
	const fallbackTabId = input.requestedTabId || input.selectableTabs[0]?.id || '';

	if (input.requestedTabId !== input.syncedRequestedTabId) {
		return fallbackTabId;
	}

	if (input.selectableTabs.some((tab) => tab.id === input.activeTabId)) {
		return input.activeTabId;
	}

	return fallbackTabId;
}

export function provideSectionTabsContext(context: SectionTabsContext) {
	return setContext(SECTION_TABS_CONTEXT_KEY, context);
}

export function useSectionTabsContext() {
	return getContext<SectionTabsContext>(SECTION_TABS_CONTEXT_KEY);
}
