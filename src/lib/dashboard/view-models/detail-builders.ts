import { getActivityLevelLabel } from '$lib/dashboard/view-models/deal';
import type { CanvasHeroData } from '$lib/dashboard/ui/detail/CanvasHero.types';
import type { FileUploadFieldData } from '$lib/dashboard/ui/detail/FileUploadField.types';

type DealHeroInput = {
	dealNumber: number;
	dealName: string;
	stage: string;
	probability: number;
	activityLevel: Parameters<typeof getActivityLevelLabel>[0];
	context: {
		summary: string;
	};
};

export function buildDealHero(deal: DealHeroInput): CanvasHeroData {
	const activityLabel = getActivityLevelLabel(deal.activityLevel).toLowerCase();

	return {
		dealNumber: deal.dealNumber,
		title: deal.dealName,
		description: `${deal.dealName} is in ${deal.stage} and is ${deal.probability}% likely to close with ${activityLabel}. ${deal.context.summary}`
	};
}

export function buildDealUploadFieldData(
	dealName: string,
	descriptionPrefix = 'Upload call notes, security review feedback, or procurement documents that add context to'
): FileUploadFieldData {
	return {
		sectionId: 'update',
		uploadLabel: 'Upload files',
		uploadDescription: `${descriptionPrefix} ${dealName}.`
	};
}
