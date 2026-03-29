import type { AccountKey } from '$lib/types/keys';
import type { ActivityLevel } from '$lib/types/vocab';

export type AccountSummaryRow = {
	key: AccountKey;
	account: string;
	isRenewal: boolean;
	probability: number;
	activityLevel: ActivityLevel;
	stage: string;
};
