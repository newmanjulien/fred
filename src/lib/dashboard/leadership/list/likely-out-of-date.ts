import type { DashboardHeaderUiScope } from '$lib/dashboard/shell/header/ui-controller';
import type {
	NewBusinessListPageData,
	RenewalsListPageData
} from '$lib/dashboard/page-models';

type LeadershipTableRow =
	| NewBusinessListPageData['rows'][number]
	| RenewalsListPageData['rows'][number];
type LeadershipSelectionRow = Pick<LeadershipTableRow, 'key'>;

export function getLeadershipSelectionHeaderUiScope(
	selectedRowCount: number
): DashboardHeaderUiScope {
	return selectedRowCount > 0
		? {
				buttons: [
					{
						id: 'ask-for-update',
						label: 'Ask for update',
						order: 30
					}
				]
			}
		: {};
}

export function getStaleLeadershipSelectionRowKeys(
	selectedRowKeys: Iterable<LeadershipSelectionRow['key']>,
	rows: readonly LeadershipSelectionRow[]
) {
	const visibleRowKeys = new Set(rows.map((row) => row.key));

	return [...selectedRowKeys].filter((rowKey) => !visibleRowKeys.has(rowKey));
}
