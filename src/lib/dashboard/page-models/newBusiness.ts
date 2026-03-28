import type { DashboardHeader } from '$lib/dashboard/shell/header/types';
import type { NewBusinessDetailRouteRef, NewBusinessListRouteRef } from '$lib/dashboard/routing';
import { resolveNewBusinessDetailPath } from '$lib/dashboard/routing/new-business';
import type {
	DashboardShellReadModel,
	NewBusinessDetailReadModel,
	NewBusinessListReadModel
} from '$lib/dashboard/read-models';
import {
	buildDealDetailContentPageData,
	type DealDetailContentPageData
} from './dealDetail';
import { createNewBusinessDetailHeader, createNewBusinessListHeader } from './headers';

export type NewBusinessTableRowPageData = Omit<NewBusinessListReadModel['rows'][number], 'hasDetail'> & {
	href: ReturnType<typeof resolveNewBusinessDetailPath> | null;
};

export type NewBusinessListPageData = {
	route: NewBusinessListRouteRef;
	header: DashboardHeader;
	rows: NewBusinessTableRowPageData[];
	filterDrawerData: NewBusinessListReadModel['filterDrawerData'];
};

export type NewBusinessDetailPageData = {
	route: NewBusinessDetailRouteRef;
	header: DashboardHeader;
} & DealDetailContentPageData;

export function buildNewBusinessListPageData(params: {
	route: NewBusinessListRouteRef;
	readModel: NewBusinessListReadModel;
}): NewBusinessListPageData {
	const { route, readModel } = params;

	return {
		route,
		header: createNewBusinessListHeader(route.view),
		rows: readModel.rows.map((row) => {
			const { hasDetail, ...rest } = row;

			return {
				...rest,
				href: hasDetail
					? resolveNewBusinessDetailPath({
							dealKey: row.key,
							view: route.view
						})
					: null
			};
		}),
		filterDrawerData: readModel.filterDrawerData
	};
}

export function buildNewBusinessDetailPageData(params: {
	route: NewBusinessDetailRouteRef;
	readModel: NewBusinessDetailReadModel;
	dashboardShell: DashboardShellReadModel;
}): NewBusinessDetailPageData {
	const { route, readModel, dashboardShell } = params;

	return {
		route,
		header: createNewBusinessDetailHeader(readModel.title, route.view),
		...buildDealDetailContentPageData({
			readModel,
			dashboardShell
		})
	};
}
