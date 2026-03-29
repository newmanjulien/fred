import { query } from './_generated/server';
import { getDashboardBranding } from './assets';
import {
	listMeetingRecords,
	toBrokerRecord,
	toDashboardMeeting,
	toDashboardPeople,
	toTeamMemberSummaries,
	toTeamRecord
} from './readModels';
import { dashboardShellResultValidator, type DashboardShellReadModel } from './validators';

export type { DashboardShellReadModel } from './validators';

export const getDashboardShell = query({
	args: {},
	returns: dashboardShellResultValidator,
	handler: async (ctx): Promise<DashboardShellReadModel> => {
		const meetings = await listMeetingRecords(ctx);
		const [brokers, team, branding] = await Promise.all([
			ctx.db.query('brokers').collect(),
			ctx.db.query('team').collect(),
			getDashboardBranding(ctx)
		]);
		const [brokerRecords, teamRecords] = await Promise.all([
			Promise.all(brokers.map((broker) => toBrokerRecord(ctx, broker))),
			Promise.all(team.map((teamMember) => toTeamRecord(ctx, teamMember)))
		]);

		return {
			people: toDashboardPeople(brokerRecords),
			team: toTeamMemberSummaries(teamRecords),
			meetings: meetings.map((meeting) => toDashboardMeeting(meeting)),
			defaultMeetingKey: meetings[0]?.key ?? null,
			branding
		};
	}
});
