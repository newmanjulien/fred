import type { MyAccountsDetailPath, MyAccountsListPath } from './my-accounts';
import type { NewBusinessDetailPath, NewBusinessListPath } from './new-business';
import type { OpportunitiesDetailPath, OpportunitiesListPath } from './opportunities';
import type { RenewalsDetailPath, RenewalsListPath } from './renewals';
import type {
	SinceLastMeetingDetailPath,
	SinceLastMeetingPath
} from './since-last-meeting';

export type DashboardPath =
	| MyAccountsListPath
	| MyAccountsDetailPath
	| NewBusinessListPath
	| NewBusinessDetailPath
	| RenewalsListPath
	| RenewalsDetailPath
	| OpportunitiesListPath
	| OpportunitiesDetailPath
	| SinceLastMeetingPath
	| SinceLastMeetingDetailPath;
