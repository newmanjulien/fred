import { formatIsoDateLong } from '$lib/format/date-time';
import type { OrgChartNode, OrgChartNodeRecord } from '$lib/models/org-chart';
import type {
	PersonSummaryLike,
	PersonSummaryMap
} from '$lib/models/person';
import type {
	AccountActivityRecordLike,
	TimelineItem,
	TimelineMarker
} from '$lib/models/timeline';

export type { OrgChartNode, OrgChartNodeRecord } from '$lib/models/org-chart';
export type { PersonSummaryMap } from '$lib/models/person';
export type { TimelineItem, TimelineMarker } from '$lib/models/timeline';

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
	record: AccountActivityRecordLike<BrokerRef>,
	peopleByRef: PersonSummaryMap<TPerson, BrokerRef>
): TimelineItem {
	const marker: TimelineMarker =
		record.marker.kind === 'broker-avatar'
			? {
					kind: 'avatar',
					person: resolveBrokerPerson(peopleByRef, record.marker.brokerRef)
				}
			: { kind: 'dot' };
	const presentation = record.eventKind === 'ask-for-update' ? 'callout' : 'standard';

	if (record.kind === 'actor-action') {
		return {
			kind: 'actor-action',
			id: record.id,
			actor: resolveBrokerPerson(peopleByRef, record.actorBrokerRef),
			action: record.action,
			occurredAtIso: record.occurredAtIso,
			body: record.body,
			presentation,
			marker
		};
	}

	return {
		kind: 'headline',
		id: record.id,
		title: record.title,
		occurredAtIso: record.occurredAtIso,
		body: record.body,
		presentation,
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
	const { nodesById, nodesByParentId, rootId } = indexOrgChartNodes(nodes);

	validateOrgChartGraph({
		nodes,
		nodesById,
		rootId
	});

	return buildOrgChartRoot({
		nodes,
		nodesById,
		nodesByParentId,
		rootId,
		peopleByRef
	});
}

type OrgChartNodeIndex<BrokerRef extends string> = {
	nodesById: Map<string, OrgChartNodeRecord<BrokerRef>>;
	nodesByParentId: Map<string, OrgChartNodeRecord<BrokerRef>[]>;
	rootId: string;
};

function indexOrgChartNodes<BrokerRef extends string>(
	nodes: readonly OrgChartNodeRecord<BrokerRef>[]
): OrgChartNodeIndex<BrokerRef> {
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

	return {
		nodesById,
		nodesByParentId,
		rootId: rootIds[0]
	};
}

function validateOrgChartGraph<BrokerRef extends string>(params: {
	nodes: readonly OrgChartNodeRecord<BrokerRef>[];
	nodesById: ReadonlyMap<string, OrgChartNodeRecord<BrokerRef>>;
	rootId: string;
}) {
	for (const node of params.nodes) {
		if (node.parentId && !params.nodesById.has(node.parentId)) {
			throw new Error(`Unknown parent org chart node "${node.parentId}" for "${node.id}".`);
		}
	}
}

function buildOrgChartRoot<BrokerRef extends string, TPerson extends PersonSummaryLike>(params: {
	nodes: readonly OrgChartNodeRecord<BrokerRef>[];
	nodesById: ReadonlyMap<string, OrgChartNodeRecord<BrokerRef>>;
	nodesByParentId: ReadonlyMap<string, OrgChartNodeRecord<BrokerRef>[]>;
	rootId: string;
	peopleByRef: PersonSummaryMap<TPerson, BrokerRef>;
}): OrgChartNode {
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

		const node = params.nodesById.get(nodeId);

		if (!node) {
			throw new Error(`Unknown org chart node "${nodeId}".`);
		}

		buildingNodeIds.add(nodeId);

		const broker = resolveBrokerPerson(params.peopleByRef, node.lastContactedByBrokerKey);
		const directReports = params.nodesByParentId
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

	const root = buildNode(params.rootId);

	if (builtNodes.size !== params.nodes.length) {
		const unreachableNodeIds = params.nodes
			.filter((node) => !builtNodes.has(node.id))
			.map((node) => node.id);

		throw new Error(
			`Org chart nodes are not reachable from root "${params.rootId}": ${unreachableNodeIds.join(', ')}.`
		);
	}

	return root;
}
