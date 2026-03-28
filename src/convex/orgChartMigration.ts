import type { BrokerId } from '../lib/types/ids';
import { parseIsoDate } from '../lib/types/dates';
import type { OrgChartNodeRecord } from '../lib/domain/org-chart';

type LegacyOrgChartNode = {
	id: string;
	name: string;
	role: string;
	lastContactedByBrokerId: BrokerId;
	lastContactedOnIso: string;
	directReports?: unknown[];
};

function requireString(value: unknown, path: string) {
	if (typeof value !== 'string') {
		throw new Error(`Expected string at "${path}".`);
	}

	return value;
}

function requireObject(value: unknown, path: string): Record<string, unknown> {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		throw new Error(`Expected object at "${path}".`);
	}

	return value as Record<string, unknown>;
}

function toLegacyOrgChartNode(node: unknown, path: string): LegacyOrgChartNode {
	const rawNode = requireObject(node, path);
	const directReports = rawNode.directReports;

	if (directReports !== undefined && !Array.isArray(directReports)) {
		throw new Error(`Expected array at "${path}.directReports".`);
	}

	return {
		id: requireString(rawNode.id, `${path}.id`),
		name: requireString(rawNode.name, `${path}.name`),
		role: requireString(rawNode.role, `${path}.role`),
		lastContactedByBrokerId: requireString(
			rawNode.lastContactedByBrokerId,
			`${path}.lastContactedByBrokerId`
		) as BrokerId,
		lastContactedOnIso: requireString(rawNode.lastContactedOnIso, `${path}.lastContactedOnIso`),
		...(directReports ? { directReports } : {})
	};
}

export function flattenLegacyOrgChartRoot(
	node: unknown,
	path = 'orgChartRoot',
	parentId?: string
): OrgChartNodeRecord<BrokerId>[] {
	const legacyNode = toLegacyOrgChartNode(node, path);

	return [
		{
			id: legacyNode.id,
			name: legacyNode.name,
			role: legacyNode.role,
			lastContactedByBrokerId: legacyNode.lastContactedByBrokerId,
			lastContactedOnIso: parseIsoDate(
				legacyNode.lastContactedOnIso,
				`${path}.lastContactedOnIso`
			),
			parentId
		},
		...(legacyNode.directReports ?? []).flatMap((childNode, index) =>
			flattenLegacyOrgChartRoot(childNode, `${path}.directReports[${index}]`, legacyNode.id)
		)
	];
}

export function hasLegacyOrgChartRoot(
	value: unknown
): value is {
	orgChartRoot: unknown;
} {
	return Boolean(value) && typeof value === 'object' && 'orgChartRoot' in (value as Record<string, unknown>);
}
