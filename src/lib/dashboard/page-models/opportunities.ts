import type { DashboardHeader } from '$lib/dashboard/shell/header/types';
import type {
	OpportunitiesDetailRouteRef,
	OpportunitiesListRouteRef
} from '$lib/dashboard/routing';
import { resolveOpportunitiesDetailPath } from '$lib/dashboard/routing/opportunities';
import {
	createPersonSummaryMap,
	toOrgChartRoot,
	type OrgChartNode
} from '$lib/dashboard/view-models/account-content';
import type {
	DashboardShellReadModel,
	OpportunityDetailReadModel,
	OpportunitiesListReadModel
} from '$lib/dashboard/read-models';
import { createOpportunitiesDetailHeader, createOpportunitiesListHeader } from './headers';

const OPPORTUNITIES_HERO = {
	title: 'Opportunities & risks you might help with',
	description: 'Help Julien take advantage of key opportunities and risks'
} as const;

export type OpportunityTilePageData = OpportunitiesListReadModel['opportunityTiles'][number] & {
	href: ReturnType<typeof resolveOpportunitiesDetailPath>;
};

export type OpportunitiesListPageData = {
	route: OpportunitiesListRouteRef;
	header: DashboardHeader;
	hero: typeof OPPORTUNITIES_HERO;
	opportunityTiles: OpportunityTilePageData[];
	riskTiles: OpportunityTilePageData[];
	update: OpportunitiesListReadModel['update'];
};

export type OpportunityDetailPageData = {
	route: OpportunitiesDetailRouteRef;
	header: DashboardHeader;
	hero: OpportunityDetailReadModel['hero'];
	kind: OpportunityDetailReadModel['kind'];
	activityItems: OpportunityDetailReadModel['activityItems'];
	orgChartRoot: OrgChartNode;
	update: OpportunityDetailReadModel['update'];
	rightRail: OpportunityDetailReadModel['rightRail'];
};

function toOpportunityTilePageData(
	tiles: readonly OpportunitiesListReadModel['opportunityTiles'][number][],
	meetingKey: OpportunitiesListRouteRef['meetingKey']
): OpportunityTilePageData[] {
	return tiles.map((tile) => ({
		...tile,
		href: resolveOpportunitiesDetailPath({
			insightKey: tile.key,
			meetingKey
		})
	}));
}

export function buildOpportunitiesListPageData(params: {
	route: OpportunitiesListRouteRef;
	readModel: OpportunitiesListReadModel;
}): OpportunitiesListPageData {
	const { route, readModel } = params;

	return {
		route,
		header: createOpportunitiesListHeader(route.meetingKey),
		hero: OPPORTUNITIES_HERO,
		opportunityTiles: toOpportunityTilePageData(readModel.opportunityTiles, route.meetingKey),
		riskTiles: toOpportunityTilePageData(readModel.riskTiles, route.meetingKey),
		update: readModel.update
	};
}

export function buildOpportunityDetailPageData(params: {
	route: OpportunitiesDetailRouteRef;
	readModel: OpportunityDetailReadModel;
	dashboardShell: DashboardShellReadModel;
}): OpportunityDetailPageData {
	const { route, readModel, dashboardShell } = params;
	const peopleById = createPersonSummaryMap(dashboardShell.people);

	return {
		route,
		header: createOpportunitiesDetailHeader(readModel.title, route.meetingKey),
		hero: readModel.hero,
		kind: readModel.kind,
		activityItems: readModel.activityItems,
		orgChartRoot: toOrgChartRoot(readModel.orgChartNodes, peopleById),
		update: readModel.update,
		rightRail: readModel.rightRail
	};
}
