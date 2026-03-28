import type {
	DashboardShellReadModel,
	NewBusinessDetailReadModel,
	SinceLastMeetingDetailReadModel
} from '$lib/dashboard/read-models';
import {
	createPersonSummaryMap,
	toOrgChartRoot,
	type OrgChartNode
} from '$lib/dashboard/view-models/account-content';

export type AccountDetailContentPageData = {
	hero: NewBusinessDetailReadModel['hero'];
	activityItems: NewBusinessDetailReadModel['activityItems'];
	orgChartRoot: OrgChartNode;
	update: NewBusinessDetailReadModel['update'];
	rightRail: NewBusinessDetailReadModel['rightRail'];
};

export function buildAccountDetailContentPageData(params: {
	readModel: NewBusinessDetailReadModel | SinceLastMeetingDetailReadModel;
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
