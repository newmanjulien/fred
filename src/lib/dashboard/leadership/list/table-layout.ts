export const LEADERSHIP_TABLE_HEADERS = [
	'Account',
	'Activity level',
	'Probability',
	'Owner',
	'Stage',
	'Last activity'
] as const;

export const RENEWALS_TABLE_HEADERS = [
	'Account',
	'Activity level',
	'Owner',
	'Revenue',
	'Renewal date',
	'Last activity'
] as const;

export const LEADERSHIP_TABLE_COLUMN_CLASS =
	'grid-cols-[minmax(10rem,1.35fr)_minmax(7.5rem,0.75fr)_minmax(7.75rem,0.8fr)_minmax(9rem,0.95fr)_minmax(6.5rem,0.65fr)_minmax(7rem,0.7fr)] md:grid-cols-[minmax(10rem,1.40fr)_minmax(8rem,0.75fr)_minmax(8.5rem,0.85fr)_minmax(10rem,1fr)_minmax(7rem,0.65fr)_minmax(7.5rem,0.7fr)]';

export const LEADERSHIP_TABLE_COLUMN_CLASS_WITH_SELECTION =
	'grid-cols-[var(--dashboard-table-selection-column-width)_minmax(10rem,1.35fr)_minmax(7.5rem,0.75fr)_minmax(7.75rem,0.8fr)_minmax(9rem,0.95fr)_minmax(6.5rem,0.65fr)_minmax(7rem,0.7fr)] md:grid-cols-[var(--dashboard-table-selection-column-width)_minmax(10rem,1.40fr)_minmax(8rem,0.75fr)_minmax(8.5rem,0.85fr)_minmax(10rem,1fr)_minmax(7rem,0.65fr)_minmax(7.5rem,0.7fr)]';

export const RENEWALS_TABLE_COLUMN_CLASS =
	'grid-cols-[minmax(10rem,1.45fr)_minmax(7.5rem,0.75fr)_minmax(9rem,0.95fr)_minmax(8rem,0.85fr)_minmax(8.5rem,0.95fr)_minmax(8rem,0.85fr)] md:grid-cols-[minmax(10rem,1.5fr)_minmax(8rem,0.75fr)_minmax(10rem,1fr)_minmax(8.5rem,0.9fr)_minmax(9rem,1fr)_minmax(8.5rem,0.9fr)]';

export const RENEWALS_TABLE_COLUMN_CLASS_WITH_SELECTION =
	'grid-cols-[var(--dashboard-table-selection-column-width)_minmax(10rem,1.45fr)_minmax(7.5rem,0.75fr)_minmax(9rem,0.95fr)_minmax(8rem,0.85fr)_minmax(8.5rem,0.95fr)_minmax(8rem,0.85fr)] md:grid-cols-[var(--dashboard-table-selection-column-width)_minmax(10rem,1.5fr)_minmax(8rem,0.75fr)_minmax(10rem,1fr)_minmax(8.5rem,0.9fr)_minmax(9rem,1fr)_minmax(8.5rem,0.9fr)]';

export const LEADERSHIP_TABLE_MIN_WIDTH_CLASS = 'min-w-[55rem] md:min-w-full';

export const LEADERSHIP_TABLE_MIN_WIDTH_CLASS_WITH_SELECTION =
	'min-w-[calc(55rem+var(--dashboard-table-selection-column-width))] md:min-w-full';

export const RENEWALS_TABLE_MIN_WIDTH_CLASS = 'min-w-[58rem] md:min-w-full';

export const RENEWALS_TABLE_MIN_WIDTH_CLASS_WITH_SELECTION =
	'min-w-[calc(58rem+var(--dashboard-table-selection-column-width))] md:min-w-full';
