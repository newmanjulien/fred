import type { AccountKey } from '$lib/types/keys';
import type { ActivityLevel } from '$lib/types/vocab';

export type AccountSummaryRow = {
	key: AccountKey;
	account: string;
	probability: number;
	activityLevel: ActivityLevel;
	stage: string;
};
