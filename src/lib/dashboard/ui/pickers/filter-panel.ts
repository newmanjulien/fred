export type SearchableFilterPanelOption<Id extends string = string> = {
	id: Id;
	label: string;
	[key: string]: unknown;
};

type GetFilteredOptionsParams<Option extends SearchableFilterPanelOption> = {
	options: readonly Option[];
	query: string;
	selectedValues?: readonly string[];
	sortSelectedFirst?: boolean;
};

type GetInitialHighlightedOptionIdParams<Option extends SearchableFilterPanelOption> = {
	options: readonly Option[];
	selectedValues?: readonly string[];
};

type GetNextHighlightedOptionIdParams<Option extends SearchableFilterPanelOption> = {
	options: readonly Option[];
	currentOptionId: string | null;
	direction: 1 | -1;
};

export function getFilteredOptions<Option extends SearchableFilterPanelOption>({
	options,
	query,
	selectedValues = [],
	sortSelectedFirst = false
}: GetFilteredOptionsParams<Option>) {
	const normalizedQuery = query.trim().toLocaleLowerCase();
	const filteredOptions =
		normalizedQuery.length === 0
			? [...options]
			: options.filter((option) => option.label.toLocaleLowerCase().includes(normalizedQuery));

	if (!sortSelectedFirst) {
		return filteredOptions;
	}

	return filteredOptions.sort((left, right) => {
		const leftSelected = selectedValues.includes(left.id);
		const rightSelected = selectedValues.includes(right.id);

		if (leftSelected !== rightSelected) {
			return leftSelected ? -1 : 1;
		}

		return left.label.localeCompare(right.label);
	});
}

export function getInitialHighlightedOptionId<Option extends SearchableFilterPanelOption>({
	options,
	selectedValues = []
}: GetInitialHighlightedOptionIdParams<Option>) {
	return options.find((option) => selectedValues.includes(option.id))?.id ?? options[0]?.id ?? null;
}

export function getNextHighlightedOptionId<Option extends SearchableFilterPanelOption>({
	options,
	currentOptionId,
	direction
}: GetNextHighlightedOptionIdParams<Option>) {
	if (options.length === 0) {
		return null;
	}

	const currentIndex = currentOptionId
		? options.findIndex((option) => option.id === currentOptionId)
		: -1;

	if (currentIndex < 0) {
		return direction === 1 ? options[0].id : options[options.length - 1].id;
	}

	const nextIndex = (currentIndex + direction + options.length) % options.length;
	return options[nextIndex].id;
}
