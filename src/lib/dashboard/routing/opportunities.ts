import type { InsightKey, MeetingKey } from '$lib/types/keys';

const OPPORTUNITIES_BASE_PATH = '/opportunities';

export type OpportunitiesListPath = '/opportunities' | `/opportunities?meetingKey=${MeetingKey}`;
export type OpportunitiesDetailPath =
	| `/opportunities/detail/${InsightKey}`
	| `/opportunities/detail/${InsightKey}?meetingKey=${MeetingKey}`;

export function resolveOpportunitiesListPath(
	meetingKey: MeetingKey | null
): OpportunitiesListPath {
	return meetingKey
		? (`${OPPORTUNITIES_BASE_PATH}?meetingKey=${meetingKey}` as OpportunitiesListPath)
		: OPPORTUNITIES_BASE_PATH;
}

export function resolveOpportunitiesDetailPath(params: {
	insightKey: InsightKey;
	meetingKey: MeetingKey | null;
}): OpportunitiesDetailPath {
	const detailPath = `${OPPORTUNITIES_BASE_PATH}/detail/${params.insightKey}` as const;

	return params.meetingKey
		? (`${detailPath}?meetingKey=${params.meetingKey}` as OpportunitiesDetailPath)
		: detailPath;
}
