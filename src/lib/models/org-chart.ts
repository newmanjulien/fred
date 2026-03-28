import type { IsoDate } from '$lib/types/dates';
import type { BrokerKey } from '$lib/types/keys';

export type OrgChartNode = {
	id: string;
	name: string;
	role: string;
	lastContacted: {
		by: string;
		on: string;
	};
	directReports?: OrgChartNode[];
};

export type OrgChartNodeRecord<BrokerRef extends string = BrokerKey> = {
	id: string;
	name: string;
	role: string;
	lastContactedByBrokerKey: BrokerRef;
	lastContactedOnIso: IsoDate;
	parentId?: string;
};
