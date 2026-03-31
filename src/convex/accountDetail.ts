import type { QueryCtx } from './_generated/server';
import type { BrokerId } from '../lib/types/ids';
import type { AccountKey } from '../lib/types/keys';
import { sortAccountActivitiesAscending } from '../lib/dashboard/view-models/account';
import {
	type PersonSummaryMap,
	resolveOptionalBrokerPerson,
	toTimelineItem
} from '../lib/dashboard/view-models/account-content';
import {
	buildAccountHero,
	buildAccountUploadFieldData
} from '../lib/dashboard/view-models/detail-builders';
import {
	toDetailRightRailData,
	toDetailRightRailHelpfulContactsSection,
	toDetailRightRailOverviewSection,
	toDetailRightRailTimingSection
} from '../lib/dashboard/detail/right-rail';
import {
	type AccountRecordData,
	createBrokerKeyByIdMap,
	createDashboardPersonByBrokerIdMap,
	findAccountDocumentByKey,
	toActivityRecord,
	toBrokerRecord,
	toDashboardOrgChartNodes,
	toAccountRecord
} from './readModels';
import type { DashboardPerson } from '../lib/models/person';
import type { AccountDetailReadModel } from './validators';

type AccountDetailReadModelOptions = {
	timingSection?: 'claimed' | 'renewal-date';
};

async function resolveAccountActivities(
	ctx: QueryCtx,
	account: NonNullable<Awaited<ReturnType<typeof findAccountDocumentByKey>>>
) {
	return ctx.db
		.query('activities')
		.withIndex('by_account_id_stream_occurred_at_iso', (query) =>
			query.eq('accountId', account._id).eq('stream', 'account-detail')
		)
		.collect();
}

function buildDetailReadModel(params: {
	accountRecord: AccountRecordData & {
		context: NonNullable<AccountRecordData['context']>;
	};
	activities: Awaited<ReturnType<typeof resolveAccountActivities>>;
	peopleByBrokerId: PersonSummaryMap<DashboardPerson, BrokerId>;
	brokerKeyById: ReturnType<typeof createBrokerKeyByIdMap>;
	options?: AccountDetailReadModelOptions;
}): AccountDetailReadModel {
	const { accountRecord, activities, peopleByBrokerId, brokerKeyById, options } = params;

	return {
		title: accountRecord.accountName,
		hero: buildAccountHero({
			accountNumber: accountRecord.accountNumber,
			accountName: accountRecord.accountName,
			kind: accountRecord.kind,
			stage: accountRecord.stage,
			probability: accountRecord.probability,
			activityLevel: accountRecord.activityLevel,
			context: accountRecord.context
		}),
		activityItems: sortAccountActivitiesAscending(
			activities.map((activity) => toActivityRecord(activity))
		).map((activity) => toTimelineItem(activity, peopleByBrokerId)),
		orgChartNodes: toDashboardOrgChartNodes(accountRecord.context.orgChartNodes, brokerKeyById),
		update: buildAccountUploadFieldData(accountRecord.accountName),
		rightRail: toDetailRightRailData([
			toDetailRightRailOverviewSection(
				accountRecord,
				resolveOptionalBrokerPerson(peopleByBrokerId, accountRecord.ownerBrokerId)
			),
			toDetailRightRailTimingSection(accountRecord, accountRecord.context, {
				showRenewalDate: options?.timingSection === 'renewal-date'
			}),
			toDetailRightRailHelpfulContactsSection(accountRecord.context)
		])
	};
}

export async function getAccountDetailReadModel(
	ctx: QueryCtx,
	accountKey: AccountKey,
	options?: AccountDetailReadModelOptions
): Promise<AccountDetailReadModel | null> {
	const [account, brokers] = await Promise.all([
		findAccountDocumentByKey(ctx, accountKey),
		ctx.db.query('brokers').collect()
	]);

	if (!account) {
		return null;
	}

	const activities = await resolveAccountActivities(ctx, account);
	const accountRecord = toAccountRecord(account);

	if (!accountRecord.context) {
		return null;
	}

	const brokerRecords = await Promise.all(brokers.map((broker) => toBrokerRecord(ctx, broker)));
	const peopleByBrokerId = createDashboardPersonByBrokerIdMap(brokerRecords);
	const brokerKeyById = createBrokerKeyByIdMap(brokerRecords);

	return buildDetailReadModel({
		accountRecord: {
			...accountRecord,
			context: accountRecord.context
		},
		activities,
		peopleByBrokerId,
		brokerKeyById,
		options
	});
}
