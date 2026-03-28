import { query } from './_generated/server';
import {
	listMeetingRecords,
	toBrokerRecord,
	toDashboardMeeting,
	toDashboardPeople
} from './readModels';
import {
	dashboardShellResultValidator,
	type DashboardShellReadModel
} from './validators';

export type { DashboardShellReadModel } from './validators';

export const getDashboardShell = query({
	args: {},
	returns: dashboardShellResultValidator,
	handler: async (ctx): Promise<DashboardShellReadModel> => {
		const [meetings, brokers] = await Promise.all([
			listMeetingRecords(ctx),
			ctx.db.query('brokers').collect()
		]);
		const brokerRecords = await Promise.all(brokers.map((broker) => toBrokerRecord(ctx, broker)));

		return {
			people: toDashboardPeople(brokerRecords),
			meetings: meetings.map((meeting) => toDashboardMeeting(meeting)),
			defaultMeetingKey: meetings[0]?.key ?? null
		};
	}
});
