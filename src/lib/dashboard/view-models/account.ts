import type { IsoDate } from '$lib/types/dates';
import type { AccountKind, ActivityLevel } from '$lib/types/vocab';

export type { AccountSummaryRow } from '$lib/models/account';

export type ActivityLevelIconVariant = 'full-grid' | 'half-grid' | 'quarter-grid';

const ACTIVITY_LEVEL_LABELS = {
	high: 'High activity',
	medium: 'Medium activity',
	low: 'Low activity'
} as const satisfies Record<ActivityLevel, string>;

const ACTIVITY_LEVEL_ICON_VARIANTS = {
	high: 'full-grid',
	medium: 'half-grid',
	low: 'quarter-grid'
} as const satisfies Record<ActivityLevel, ActivityLevelIconVariant>;

type ActivityRecordLike = {
	occurredOnIso: IsoDate;
	id: string;
};

type NewsRecordLike = {
	id: string;
	publishedOnIso: IsoDate;
};

export function getActivityLevelLabel(activityLevel: ActivityLevel) {
	return ACTIVITY_LEVEL_LABELS[activityLevel];
}

export function getProbabilityLabel(accountKind: AccountKind) {
	return accountKind === 'renewal' ? 'likely to renew' : 'likely to close';
}

export function getActivityLevelIconVariant(activityLevel: ActivityLevel) {
	return ACTIVITY_LEVEL_ICON_VARIANTS[activityLevel];
}

export function sortAccountActivitiesAscending<T extends ActivityRecordLike>(records: readonly T[]) {
	return [...records].sort((left, right) => {
		const dateComparison = left.occurredOnIso.localeCompare(right.occurredOnIso);

		if (dateComparison !== 0) {
			return dateComparison;
		}

		return left.id.localeCompare(right.id);
	});
}

export function sortAccountNewsDescending<T extends NewsRecordLike>(records: readonly T[]) {
	return [...records].sort((left, right) => {
		const dateComparison = right.publishedOnIso.localeCompare(left.publishedOnIso);

		if (dateComparison !== 0) {
			return dateComparison;
		}

		return left.id.localeCompare(right.id);
	});
}

export function getLatestAccountActivity<T extends ActivityRecordLike>(records: readonly T[]) {
	const sortedRecords = sortAccountActivitiesAscending(records);

	return sortedRecords[sortedRecords.length - 1] ?? null;
}

export function getLatestAccountNews<T extends NewsRecordLike>(records: readonly T[]) {
	return sortAccountNewsDescending(records)[0] ?? null;
}

export function formatAccountNumber(accountNumber: number): string {
	return `#${accountNumber}`;
}
