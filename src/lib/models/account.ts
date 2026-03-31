import type { IsoDate } from '$lib/types/dates';
import type { AccountKey } from '$lib/types/keys';
import type { AccountKind, ActivityLevel } from '$lib/types/vocab';

export type AccountSummaryRow = {
	key: AccountKey;
	kind: AccountKind;
	account: string;
	renewalDate?: IsoDate;
	probability: number;
	activityLevel: ActivityLevel;
	stage?: string;
};
