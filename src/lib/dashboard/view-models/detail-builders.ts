import { getActivityLevelLabel } from '$lib/dashboard/view-models/account';
import { getProbabilityLabel } from '$lib/dashboard/view-models/account';
import type { CanvasHeroData } from '$lib/dashboard/ui/detail/CanvasHero.types';
import type { FileUploadFieldData } from '$lib/dashboard/ui/detail/FileUploadField.types';

type AccountHeroInput = {
	accountNumber: number;
	accountName: string;
	isRenewal: boolean;
	stage: string;
	probability: number;
	activityLevel: Parameters<typeof getActivityLevelLabel>[0];
	context: {
		summary: string;
	};
};

export function buildAccountHero(account: AccountHeroInput): CanvasHeroData {
	const activityLabel = getActivityLevelLabel(account.activityLevel).toLowerCase();
	const probabilityLabel = getProbabilityLabel(account.isRenewal);

	return {
		accountNumber: account.accountNumber,
		title: account.accountName,
		description: `${account.accountName} is in ${account.stage} and is ${account.probability}% ${probabilityLabel} with ${activityLabel}. ${account.context.summary}`
	};
}

export function buildAccountUploadFieldData(
	accountName: string,
	descriptionPrefix = 'Upload call notes, security review feedback, or procurement documents that add context to'
): FileUploadFieldData {
	return {
		sectionId: 'update',
		uploadLabel: 'Upload files',
		uploadDescription: `${descriptionPrefix} ${accountName}.`
	};
}
