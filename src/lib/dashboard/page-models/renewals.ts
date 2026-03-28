import type { DashboardHeader } from '$lib/dashboard/shell/header/types';
import type { RenewalsDetailRouteRef, RenewalsListRouteRef } from '$lib/dashboard/routing';
import { resolveRenewalsDetailPath } from '$lib/dashboard/routing/renewals';
import type {
	DashboardShellReadModel,
	NewBusinessDetailReadModel,
	NewBusinessListReadModel
} from '$lib/dashboard/read-models';
import {
	buildAccountDetailContentPageData,
	type AccountDetailContentPageData
} from './accountDetail';
import { createRenewalsDetailHeader, createRenewalsListHeader } from './headers';

export type RenewalsTableRowPageData = Omit<NewBusinessListReadModel['rows'][number], 'hasDetail'> & {
	href: ReturnType<typeof resolveRenewalsDetailPath> | null;
};

export type RenewalsListPageData = {
	route: RenewalsListRouteRef;
	header: DashboardHeader;
	rows: RenewalsTableRowPageData[];
	filterDrawerData: NewBusinessListReadModel['filterDrawerData'];
};

export type RenewalsDetailPageData = {
	route: RenewalsDetailRouteRef;
	header: DashboardHeader;
} & AccountDetailContentPageData;

export function buildRenewalsListPageData(params: {
	route: RenewalsListRouteRef;
	readModel: NewBusinessListReadModel;
}): RenewalsListPageData {
	const { route, readModel } = params;

	return {
		route,
		header: createRenewalsListHeader(route.view),
		rows: readModel.rows.map((row) => {
			const { hasDetail, ...rest } = row;

			return {
				...rest,
				href: hasDetail
					? resolveRenewalsDetailPath({
							accountKey: row.key,
							view: route.view
						})
					: null
			};
		}),
		filterDrawerData: readModel.filterDrawerData
	};
}

export function buildRenewalsDetailPageData(params: {
	route: RenewalsDetailRouteRef;
	readModel: NewBusinessDetailReadModel;
	dashboardShell: DashboardShellReadModel;
}): RenewalsDetailPageData {
	const { route, readModel, dashboardShell } = params;

	return {
		route,
		header: createRenewalsDetailHeader(readModel.title, route.view),
		...buildAccountDetailContentPageData({
			readModel,
			dashboardShell
		})
	};
}
