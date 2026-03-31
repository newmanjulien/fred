import type { AccountUpdateRequestStatus } from '$lib/models/timeline';

export const ASK_FOR_UPDATE_ACTION_LABEL = 'asked for an update' as const;

export function formatAskForUpdateBody(status: AccountUpdateRequestStatus) {
	return status === 'provided' ? 'Update provided.' : 'Waiting for update...';
}
