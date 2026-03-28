type HeaderMenuOption<TId extends string> = {
	id: TId;
	label: string;
};

type BuildHeaderTitleMenuOptionsParams<TId extends string> = {
	selectedId: TId;
	options: readonly HeaderMenuOption<TId>[];
};

export function buildHeaderTitleMenuOptions<TId extends string>({
	selectedId,
	options
}: BuildHeaderTitleMenuOptionsParams<TId>) {
	return options.map((option) => ({
			id: option.id,
			label: option.label,
			current: option.id === selectedId
		}));
}
