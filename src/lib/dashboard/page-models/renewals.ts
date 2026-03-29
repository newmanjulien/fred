import type { DashboardHeader } from '$lib/dashboard/shell/header/types';
import type { DashboardLinkTarget } from '$lib/dashboard/links';
import type { RenewalsDetailRouteRef, RenewalsListRouteRef } from '$lib/dashboard/routing';
import { resolveRenewalsDetailPath } from '$lib/dashboard/routing/renewals';
import type {
	AccountDetailReadModel,
	AccountListReadModel,
	DashboardShellReadModel
} from '$lib/dashboard/read-models';
import {
	buildAccountDetailContentPageData,
	type AccountDetailContentPageData
} from './accountDetail';
import { createRenewalsDetailHeader, createRenewalsListHeader } from './headers';

type RenewalsNavigation = Extract<DashboardLinkTarget, { kind: 'renewals' | 'none' }>;

function toRenewalsNavigation(
	route: RenewalsListRouteRef,
	row: AccountListReadModel['rows'][number]
): RenewalsNavigation {
	if (!row.hasDetail) {
		return {
			kind: 'none'
		};
	}

	return {
		kind: 'renewals',
		href: resolveRenewalsDetailPath({
			accountKey: row.key,
			view: route.view
		})
	};
}

export type RenewalsTableRowPageData = Omit<AccountListReadModel['rows'][number], 'hasDetail'> & {
	navigation: RenewalsNavigation;
};

export type RenewalsListPageData = {
	route: RenewalsListRouteRef;
	header: DashboardHeader;
	rows: RenewalsTableRowPageData[];
	filterDrawerData: AccountListReadModel['filterDrawerData'];
};

export type RenewalsDetailPageData = {
	route: RenewalsDetailRouteRef;
	header: DashboardHeader;
} & AccountDetailContentPageData;

export function buildRenewalsListPageData(params: {
	route: RenewalsListRouteRef;
	readModel: AccountListReadModel;
}): RenewalsListPageData {
	const { route, readModel } = params;

	return {
		route,
		header: createRenewalsListHeader(route.view),
		rows: readModel.rows.map((row) => {
			const { hasDetail, ...rest } = row;
			void hasDetail;

			return {
				...rest,
				navigation: toRenewalsNavigation(route, row)
			};
		}),
		filterDrawerData: readModel.filterDrawerData
	};
}

export function buildRenewalsDetailPageData(params: {
	route: RenewalsDetailRouteRef;
	readModel: AccountDetailReadModel;
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
