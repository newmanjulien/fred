import type { DashboardHeader } from '$lib/dashboard/shell/header/types';
import type { NewBusinessDetailRouteRef, NewBusinessListRouteRef } from '$lib/dashboard/routing';
import { resolveNewBusinessDetailPath } from '$lib/dashboard/routing/new-business';
import type {
	AccountDetailReadModel,
	AccountListReadModel,
	DashboardShellReadModel
} from '$lib/dashboard/read-models';
import {
	buildAccountDetailContentPageData,
	type AccountDetailContentPageData
} from './accountDetail';
import { createNewBusinessDetailHeader, createNewBusinessListHeader } from './headers';

export type NewBusinessTableRowPageData = Omit<AccountListReadModel['rows'][number], 'hasDetail'> & {
	href: ReturnType<typeof resolveNewBusinessDetailPath> | null;
};

export type NewBusinessListPageData = {
	route: NewBusinessListRouteRef;
	header: DashboardHeader;
	rows: NewBusinessTableRowPageData[];
	filterDrawerData: AccountListReadModel['filterDrawerData'];
};

export type NewBusinessDetailPageData = {
	route: NewBusinessDetailRouteRef;
	header: DashboardHeader;
} & AccountDetailContentPageData;

export function buildNewBusinessListPageData(params: {
	route: NewBusinessListRouteRef;
	readModel: AccountListReadModel;
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
							accountKey: row.key,
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
	readModel: AccountDetailReadModel;
	dashboardShell: DashboardShellReadModel;
}): NewBusinessDetailPageData {
	const { route, readModel, dashboardShell } = params;

	return {
		route,
		header: createNewBusinessDetailHeader(readModel.title, route.view),
		...buildAccountDetailContentPageData({
			readModel,
			dashboardShell
		})
	};
}
