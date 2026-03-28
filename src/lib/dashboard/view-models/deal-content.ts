import type { BrokerKey } from '$lib/types/keys';
import type { IsoDate } from '$lib/types/dates';
import { formatIsoDateLong } from '$lib/format/date-time';

type PersonSummaryLike = {
	key: string;
	name: string;
	avatar: string;
};

type TimelineMarkerRecord<BrokerRef extends string = string> =
	| {
			kind: 'dot';
	  }
	| {
			kind: 'broker-avatar';
			brokerRef: BrokerRef;
	  };

type DealActivityRecordLike<BrokerRef extends string = string> =
	| {
			kind: 'headline';
			id: string;
			occurredOnIso: IsoDate;
			body: string;
			marker: TimelineMarkerRecord<BrokerRef>;
			title: string;
	  }
	| {
			kind: 'actor-action';
			id: string;
			occurredOnIso: IsoDate;
			body: string;
			marker: TimelineMarkerRecord<BrokerRef>;
			actorBrokerRef: BrokerRef;
			action: string;
	  };

export type TimelineMarker =
	| {
			kind: 'dot';
	  }
	| {
			kind: 'avatar';
			person: PersonSummaryLike;
	  };

type TimelineItemBase = {
	id: string;
	occurredOnIso: IsoDate;
	body: string;
	marker: TimelineMarker;
};

export type TimelineItem =
	| (TimelineItemBase & {
			kind: 'headline';
			title: string;
	  })
	| (TimelineItemBase & {
			kind: 'actor-action';
			actor: PersonSummaryLike;
			action: string;
	  });

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

export type PersonSummaryMap<
	TPerson extends PersonSummaryLike = PersonSummaryLike,
	TRef extends string = TPerson['key']
> = ReadonlyMap<TRef, TPerson>;

export function createPersonSummaryMap<TPerson extends PersonSummaryLike>(
	people: readonly TPerson[]
): PersonSummaryMap<TPerson> {
	return new Map(people.map((person) => [person.key, person]));
}

export function resolveBrokerPerson<TRef extends string, TPerson extends PersonSummaryLike>(
	peopleByRef: PersonSummaryMap<TPerson, TRef>,
	brokerRef: TRef
): TPerson {
	const broker = peopleByRef.get(brokerRef);

	if (!broker) {
		throw new Error(`Unknown broker "${brokerRef}".`);
	}

	return broker;
}

export function resolveOptionalBrokerPerson<TRef extends string, TPerson extends PersonSummaryLike>(
	peopleByRef: PersonSummaryMap<TPerson, TRef>,
	brokerRef: TRef | null
): TPerson | null {
	return brokerRef ? resolveBrokerPerson(peopleByRef, brokerRef) : null;
}

export function toTimelineItem<
	BrokerRef extends string,
	TPerson extends PersonSummaryLike
>(
	record: DealActivityRecordLike<BrokerRef>,
	peopleByRef: PersonSummaryMap<TPerson, BrokerRef>
): TimelineItem {
	const marker: TimelineMarker =
		record.marker.kind === 'broker-avatar'
			? {
					kind: 'avatar',
					person: resolveBrokerPerson(peopleByRef, record.marker.brokerRef)
				}
			: { kind: 'dot' };

	if (record.kind === 'actor-action') {
		return {
			kind: 'actor-action',
			id: record.id,
			actor: resolveBrokerPerson(peopleByRef, record.actorBrokerRef),
			action: record.action,
			occurredOnIso: record.occurredOnIso,
			body: record.body,
			marker
		};
	}

	return {
		kind: 'headline',
		id: record.id,
		title: record.title,
		occurredOnIso: record.occurredOnIso,
		body: record.body,
		marker
	};
}

export function toOrgChartRoot<
	BrokerRef extends string,
	TPerson extends PersonSummaryLike
>(
	nodes: readonly OrgChartNodeRecord<BrokerRef>[],
	peopleByRef: PersonSummaryMap<TPerson, BrokerRef>
): OrgChartNode {
	const nodesById = new Map<string, OrgChartNodeRecord<BrokerRef>>();
	const nodesByParentId = new Map<string, OrgChartNodeRecord<BrokerRef>[]>();
	const rootIds: string[] = [];

	for (const node of nodes) {
		if (nodesById.has(node.id)) {
			throw new Error(`Duplicate org chart node id "${node.id}".`);
		}

		nodesById.set(node.id, node);

		if (!node.parentId) {
			rootIds.push(node.id);
			continue;
		}

		const existingNodes = nodesByParentId.get(node.parentId);

		if (existingNodes) {
			existingNodes.push(node);
			continue;
		}

		nodesByParentId.set(node.parentId, [node]);
	}

	if (rootIds.length === 0) {
		throw new Error('Missing root org chart node.');
	}

	if (rootIds.length > 1) {
		throw new Error(`Expected exactly one root org chart node, found ${rootIds.length}.`);
	}

	for (const node of nodes) {
		if (node.parentId && !nodesById.has(node.parentId)) {
			throw new Error(`Unknown parent org chart node "${node.parentId}" for "${node.id}".`);
		}
	}

	const builtNodes = new Map<string, OrgChartNode>();
	const buildingNodeIds = new Set<string>();

	function buildNode(nodeId: string): OrgChartNode {
		const existingNode = builtNodes.get(nodeId);

		if (existingNode) {
			return existingNode;
		}

		if (buildingNodeIds.has(nodeId)) {
			throw new Error(`Cycle detected in org chart at node "${nodeId}".`);
		}

		const node = nodesById.get(nodeId);

		if (!node) {
			throw new Error(`Unknown org chart node "${nodeId}".`);
		}

		buildingNodeIds.add(nodeId);

		const broker = resolveBrokerPerson(peopleByRef, node.lastContactedByBrokerKey);
		const directReports = nodesByParentId
			.get(nodeId)
			?.map((childNode) => buildNode(childNode.id));

		const orgChartNode = {
			id: node.id,
			name: node.name,
			role: node.role,
			lastContacted: {
				by: broker.name,
				on: formatIsoDateLong(node.lastContactedOnIso)
			},
			...(directReports?.length ? { directReports } : {})
		};

		buildingNodeIds.delete(nodeId);
		builtNodes.set(nodeId, orgChartNode);

		return orgChartNode;
	}

	const root = buildNode(rootIds[0]);

	if (builtNodes.size !== nodes.length) {
		const unreachableNodeIds = nodes
			.filter((node) => !builtNodes.has(node.id))
			.map((node) => node.id);

		throw new Error(
			`Org chart nodes are not reachable from root "${rootIds[0]}": ${unreachableNodeIds.join(', ')}.`
		);
	}

	return root;
}
