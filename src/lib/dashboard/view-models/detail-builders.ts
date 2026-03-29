import { getActivityLevelLabel } from '$lib/dashboard/view-models/account';
import { getProbabilityLabel } from '$lib/dashboard/view-models/account';
import type { CanvasHeroData } from '$lib/dashboard/ui/detail/CanvasHero.types';
import type { FileUploadFieldData } from '$lib/dashboard/ui/detail/FileUploadField.types';
import type { TeamMemberSummary } from '$lib/models/person';

const UPDATE_QUOTE_PERSON_KEYS = ['morgan-lee', 'taylor-shah'] as const;
const UPDATE_QUOTE_TEXT =
	'We prepared the insight in this dashboard using the data which was available but we do not have the full picture. Upload anything we missed so we can update the dashboard';
const UPDATE_QUOTE_ROLE = 'Data scientists at Overbase';

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

export function withPreparedDataQuote(
	data: FileUploadFieldData,
	people: readonly TeamMemberSummary[],
	branding: {
		logoUrl: string;
		logoAlt: string;
	}
): FileUploadFieldData {
	const quotePeople = UPDATE_QUOTE_PERSON_KEYS.map((key) =>
		people.find((person) => person.key === key)
	).filter((person): person is TeamMemberSummary => Boolean(person));

	if (quotePeople.length === 0) {
		return data;
	}

	return {
		...data,
		quote: {
			text: UPDATE_QUOTE_TEXT,
			people: quotePeople.map((person) => ({
				name: person.name,
				avatar: person.avatar
			})),
			attribution: quotePeople.map((person) => person.name).join(' & '),
			role: UPDATE_QUOTE_ROLE,
			logoSrc: branding.logoUrl,
			logoAlt: branding.logoAlt
		}
	};
}
