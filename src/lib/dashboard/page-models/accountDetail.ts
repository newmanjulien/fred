import type {
	AccountDetailReadModel,
	DashboardShellReadModel,
	SinceLastMeetingDetailReadModel
} from '$lib/dashboard/read-models';
import {
	createPersonSummaryMap,
	toOrgChartRoot,
	type OrgChartNode
} from '$lib/dashboard/view-models/account-content';

export type AccountDetailContentPageData = {
	hero: AccountDetailReadModel['hero'];
	activityItems: AccountDetailReadModel['activityItems'];
	orgChartRoot: OrgChartNode;
	update: AccountDetailReadModel['update'];
	rightRail: AccountDetailReadModel['rightRail'];
};

export function buildAccountDetailContentPageData(params: {
	readModel: AccountDetailReadModel | SinceLastMeetingDetailReadModel;
	dashboardShell: DashboardShellReadModel;
}): AccountDetailContentPageData {
	const { readModel, dashboardShell } = params;
	const peopleById = createPersonSummaryMap(dashboardShell.people);

	return {
		hero: readModel.hero,
		activityItems: readModel.activityItems,
		orgChartRoot: toOrgChartRoot(readModel.orgChartNodes, peopleById),
		update: readModel.update,
		rightRail: readModel.rightRail
	};
}
