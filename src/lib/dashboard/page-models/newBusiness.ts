import type { DashboardHeader } from '$lib/dashboard/shell/header/types';
import type { DashboardLinkTarget } from '$lib/dashboard/links';
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

type NewBusinessNavigation = Extract<DashboardLinkTarget, { kind: 'new-business' | 'none' }>;

function toNewBusinessNavigation(
	route: NewBusinessListRouteRef,
	row: AccountListReadModel['rows'][number]
): NewBusinessNavigation {
	if (!row.hasDetail) {
		return {
			kind: 'none'
		};
	}

	return {
		kind: 'new-business',
		href: resolveNewBusinessDetailPath({
			accountKey: row.key,
			view: route.view
		})
	};
}

export type NewBusinessTableRowPageData = Omit<AccountListReadModel['rows'][number], 'hasDetail'> & {
	navigation: NewBusinessNavigation;
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
			void hasDetail;

			return {
				...rest,
				navigation: toNewBusinessNavigation(route, row)
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
