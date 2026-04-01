import type { AccountListRowReadModel } from '$lib/dashboard/read-models';
import { LEADERSHIP_SELECTION_INFO_TEXT } from './selection-ui';

type LeadershipFooterRow = Pick<AccountListRowReadModel, 'lastActivity'>;

export type LeadershipTableFooterContent =
	| {
			kind: 'none';
	  }
	| {
			kind: 'default';
			message: string;
			showLearnMore: false;
	  }
	| {
			kind: 'selected' | 'waiting';
			message: string;
			showLearnMore: true;
	  };

function getWaitingFooterMessage(waitingRowCount: number) {
	return waitingRowCount === 1
		? "You requested an update and we're waiting for the broker to answer"
		: "You requested updates and we're waiting for the brokers to answer";
}

export function getLeadershipTableFooterContent(params: {
	defaultText?: string | null;
	selectedRowCount: number;
	visibleRows: readonly LeadershipFooterRow[];
}): LeadershipTableFooterContent {
	if (params.selectedRowCount > 0) {
		return {
			kind: 'selected',
			message: LEADERSHIP_SELECTION_INFO_TEXT,
			showLearnMore: true
		};
	}

	const waitingRowCount = params.visibleRows.filter(
		(row) => row.lastActivity.kind === 'waiting-for-update'
	).length;

	if (waitingRowCount > 0) {
		return {
			kind: 'waiting',
			message: getWaitingFooterMessage(waitingRowCount),
			showLearnMore: true
		};
	}

	if (params.defaultText?.trim()) {
		return {
			kind: 'default',
			message: params.defaultText,
			showLearnMore: false
		};
	}

	return {
		kind: 'none'
	};
}
