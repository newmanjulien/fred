import type {
	DashboardHeaderButtonHandler,
	DashboardHeaderUiScope
} from '$lib/dashboard/shell/header/ui-controller';
import type {
	NewBusinessListPageData,
	RenewalsListPageData
} from '$lib/dashboard/page-models';

type LeadershipTableRow =
	| NewBusinessListPageData['rows'][number]
	| RenewalsListPageData['rows'][number];
type LeadershipSelectionRow = Pick<LeadershipTableRow, 'key'>;

export const LEADERSHIP_SELECTION_INFO_TEXT =
	'Ask for update sends a notification to the broker';

export function getLeadershipSelectionHeaderUiScope(
	selectedRowCount: number,
	askForUpdateHandler?: DashboardHeaderButtonHandler
): DashboardHeaderUiScope {
	return selectedRowCount > 0
		? {
				buttons: [
					{
						id: 'ask-for-update',
						label: 'Ask for update',
						order: 30
					}
				],
				handlers: askForUpdateHandler
					? {
							'ask-for-update': askForUpdateHandler
						}
					: undefined
			}
		: {};
}

export function getLeadershipSelectionInfoText(selectedRowCount: number) {
	return selectedRowCount > 0 ? LEADERSHIP_SELECTION_INFO_TEXT : null;
}

export function getStaleLeadershipSelectionRowKeys(
	selectedRowKeys: Iterable<LeadershipSelectionRow['key']>,
	rows: readonly LeadershipSelectionRow[]
) {
	const visibleRowKeys = new Set(rows.map((row) => row.key));

	return [...selectedRowKeys].filter((rowKey) => !visibleRowKeys.has(rowKey));
}
