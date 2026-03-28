import type { IsoDate } from '$lib/types/dates';
import type { BrokerId } from '$lib/types/ids';

export type OrgChartNodeRecord<ContactById extends string = BrokerId> = {
	id: string;
	name: string;
	role: string;
	lastContactedByBrokerId: ContactById;
	lastContactedOnIso: IsoDate;
	parentId?: string;
};
