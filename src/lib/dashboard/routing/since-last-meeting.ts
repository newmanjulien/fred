import type { DealKey, MeetingKey } from '$lib/types/keys';

const SINCE_LAST_MEETING_BASE_PATH = '/since-last-meeting';
export type SinceLastMeetingPath =
	| '/since-last-meeting'
	| `/since-last-meeting?meetingKey=${MeetingKey}`;
export type SinceLastMeetingDetailPath =
	| `/since-last-meeting/detail/${DealKey}`
	| `/since-last-meeting/detail/${DealKey}?meetingKey=${MeetingKey}`;

export function resolveSinceLastMeetingPath(meetingKey: MeetingKey | null): SinceLastMeetingPath {
	return meetingKey
		? (`${SINCE_LAST_MEETING_BASE_PATH}?meetingKey=${meetingKey}` as SinceLastMeetingPath)
		: SINCE_LAST_MEETING_BASE_PATH;
}

export function resolveSinceLastMeetingDetailPath(params: {
	dealKey: DealKey;
	meetingKey: MeetingKey | null;
}): SinceLastMeetingDetailPath {
	const detailPath = `${SINCE_LAST_MEETING_BASE_PATH}/detail/${params.dealKey}` as const;

	return params.meetingKey
		? (`${detailPath}?meetingKey=${params.meetingKey}` as SinceLastMeetingDetailPath)
		: detailPath;
}
