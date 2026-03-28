import type { IsoDate } from '$lib/types/dates';
import type { DealKey } from '$lib/types/keys';
import type { ActivityLevel } from '$lib/types/vocab';

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

export type DealSummaryRow = {
	key: DealKey;
	deal: string;
	probability: number;
	activityLevel: ActivityLevel;
	stage: string;
};

export function getActivityLevelLabel(activityLevel: ActivityLevel) {
	return ACTIVITY_LEVEL_LABELS[activityLevel];
}

export function getActivityLevelIconVariant(activityLevel: ActivityLevel) {
	return ACTIVITY_LEVEL_ICON_VARIANTS[activityLevel];
}

export function sortDealActivitiesAscending<T extends ActivityRecordLike>(records: readonly T[]) {
	return [...records].sort((left, right) => {
		const dateComparison = left.occurredOnIso.localeCompare(right.occurredOnIso);

		if (dateComparison !== 0) {
			return dateComparison;
		}

		return left.id.localeCompare(right.id);
	});
}

export function sortDealNewsDescending<T extends NewsRecordLike>(records: readonly T[]) {
	return [...records].sort((left, right) => {
		const dateComparison = right.publishedOnIso.localeCompare(left.publishedOnIso);

		if (dateComparison !== 0) {
			return dateComparison;
		}

		return left.id.localeCompare(right.id);
	});
}

export function getLatestDealActivity<T extends ActivityRecordLike>(records: readonly T[]) {
	const sortedRecords = sortDealActivitiesAscending(records);

	return sortedRecords[sortedRecords.length - 1] ?? null;
}

export function getLatestDealNews<T extends NewsRecordLike>(records: readonly T[]) {
	return sortDealNewsDescending(records)[0] ?? null;
}

export function formatDealNumber(dealNumber: number): string {
	return `#${dealNumber}`;
}
