import type { MyDealsDetailPath, MyDealsListPath } from './my-deals';
import type { NewBusinessDetailPath, NewBusinessListPath } from './new-business';
import type { OpportunitiesDetailPath, OpportunitiesListPath } from './opportunities';
import type {
	SinceLastMeetingDetailPath,
	SinceLastMeetingPath
} from './since-last-meeting';

export type DashboardPath =
	| MyDealsListPath
	| MyDealsDetailPath
	| NewBusinessListPath
	| NewBusinessDetailPath
	| OpportunitiesListPath
	| OpportunitiesDetailPath
	| SinceLastMeetingPath
	| SinceLastMeetingDetailPath;
