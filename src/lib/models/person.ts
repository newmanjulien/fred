import type { IsoDate } from '$lib/types/dates';
import type { BrokerKey, MeetingKey } from '$lib/types/keys';

export type PersonSummaryLike<TKey extends string = string> = {
	key: TKey;
	name: string;
	avatar: string;
};

export type PersonSummary = PersonSummaryLike<BrokerKey>;
export type DashboardPerson = PersonSummary;
export type TeamMemberSummary = PersonSummaryLike;

export type MeetingSummary = {
	key: MeetingKey;
	dateIso: IsoDate;
};

export type DashboardMeeting = MeetingSummary;

export type PersonSummaryMap<
	TPerson extends PersonSummaryLike = PersonSummaryLike,
	TRef extends string = TPerson['key']
> = ReadonlyMap<TRef, TPerson>;
