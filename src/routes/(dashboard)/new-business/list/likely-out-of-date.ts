import type { DashboardHeaderUiScope } from '$lib/dashboard/shell/header/ui-controller';
import type { NewBusinessListPageData } from '$lib/dashboard/page-models/newBusiness';

export const LIKELY_OUT_OF_DATE_HEADER_SCOPE_ID = 'new-business-likely-out-of-date';

type NewBusinessTableRow = NewBusinessListPageData['rows'][number];
type LikelyOutOfDateRow = Pick<NewBusinessTableRow, 'key'>;

export function getLikelyOutOfDateHeaderUiScope(
	selectedRowCount: number
): DashboardHeaderUiScope | null {
	if (selectedRowCount < 1) {
		return null;
	}

	return {
		buttons: [
			{
				id: 'ask-for-update',
				label: 'Ask for update',
				order: 30
			}
		]
	};
}

export function getStaleLikelyOutOfDateSelectionRowKeys(
	selectedRowKeys: Iterable<LikelyOutOfDateRow['key']>,
	rows: readonly LikelyOutOfDateRow[]
) {
	const visibleRowKeys = new Set(rows.map((row) => row.key));

	return [...selectedRowKeys].filter((rowKey) => !visibleRowKeys.has(rowKey));
}
