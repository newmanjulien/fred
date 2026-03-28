import { error } from '@sveltejs/kit';
import type { DashboardShellReadModel } from '$lib/dashboard/read-models';
import type { MeetingKey } from '$lib/types/keys';

export function resolveSelectedMeetingKey(
	dashboardShell: Pick<DashboardShellReadModel, 'meetings' | 'defaultMeetingKey'>,
	requestedMeetingKey: string | null
): MeetingKey {
	if (requestedMeetingKey) {
		const requestedMeeting = dashboardShell.meetings.find(
			(meeting) => meeting.key === requestedMeetingKey
		);

		if (requestedMeeting) {
			return requestedMeeting.key;
		}

		throw error(404, 'Not found');
	}

	if (!dashboardShell.defaultMeetingKey) {
		throw error(503, 'No meetings available.');
	}

	return dashboardShell.defaultMeetingKey;
}
