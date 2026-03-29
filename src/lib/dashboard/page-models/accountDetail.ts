import type {
	AccountDetailReadModel,
	DashboardShellReadModel
} from '$lib/dashboard/read-models';
import {
	createPersonSummaryMap,
	toOrgChartRoot,
	type OrgChartNode
} from '$lib/dashboard/view-models/account-content';
import { withPreparedDataQuote } from '$lib/dashboard/view-models/detail-builders';

export type AccountDetailContentPageData = {
	hero: AccountDetailReadModel['hero'];
	activityItems: AccountDetailReadModel['activityItems'];
	orgChartRoot: OrgChartNode;
	update: AccountDetailReadModel['update'];
	rightRail: AccountDetailReadModel['rightRail'];
};

export function buildAccountDetailContentPageData(params: {
	readModel: AccountDetailReadModel;
	dashboardShell: DashboardShellReadModel;
}): AccountDetailContentPageData {
	const { readModel, dashboardShell } = params;
	const peopleById = createPersonSummaryMap(dashboardShell.people);

	return {
		hero: readModel.hero,
		activityItems: readModel.activityItems,
		orgChartRoot: toOrgChartRoot(readModel.orgChartNodes, peopleById),
		update: withPreparedDataQuote(readModel.update, dashboardShell.team, dashboardShell.branding),
		rightRail: readModel.rightRail
	};
}
