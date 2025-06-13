import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import * as Airtable from "airtable";
import { Record as AirtableRecord, Records as AirtableRecords, FieldSet } from "airtable";
import { Config } from "src/config";
import { serializeAirtableValue } from "src/helpers/airtable";
import { clone, pick } from "src/helpers/objects";

export type TableId = keyof Config["airtable"]["tables"];
export type TableFields<T extends TableId> = keyof Config["airtable"]["tables"][T]["fields"];

export type TableRecord<T extends TableId> = { id: string } & { [key in TableFields<T>]?: string | string[] | boolean };

export type SubscriptionEntity = TableRecord<"subscriptions">;

@Injectable()
export class DatabaseService {
	private readonly logger = new Logger(DatabaseService.name);

	private readonly airtable = new Airtable({ apiKey: this.config.airtable.apiKey });
	private readonly base = this.airtable.base(this.config.airtable.baseId);

	private readonly refreshTablesInterval = 60 * 15; // 15 minutes

	private readonly subscriptions = this.getCachedAirtable("subscriptions", { ttl: this.refreshTablesInterval });
	private readonly notifications = this.getCachedAirtable("notifications", { ttl: this.refreshTablesInterval });

	constructor(private readonly config: Config) {}

	private getCachedAirtable<T extends TableId>(tableId: T, options: { ttl?: number } = {}) {
		return new CachedAirtable(tableId, this.config.airtable.tables[tableId], this.base, options);
	}

	async refreshAll() {
		this.logger.log("Refreshing all data");
		await Promise.all([this.subscriptions.refresh(), this.notifications.refresh()]);
	}

	getSubscriptions() {
		return this.subscriptions.values();
	}

	async saveSubscription(data: Partial<Omit<SubscriptionEntity, "id">>) {
		const oldSubscription = this.getSubscription(data);

		if (oldSubscription && this.compareSubscriptions(oldSubscription, data)) return oldSubscription;

		let subscriptionId = oldSubscription?.id || null;

		if (subscriptionId) {
			return await this.subscriptions.update(subscriptionId, data);
		} else {
			return await this.subscriptions.create(data);
		}
	}

	async removeSubscription(subscriptionId: string) {
		const subscription = this.subscriptions.get(subscriptionId);
		if (!subscription) throw new NotFoundException(`Subscription not found`);

		await this.subscriptions.remove(subscriptionId);
	}

	getSubscription(subscription: Pick<SubscriptionEntity, "endpoint">) {
		return this.subscriptions.find((r) => !!r.endpoint && r.endpoint === subscription.endpoint);
	}

	async listNotifications(options: { select?: (keyof TableRecord<"notifications">)[]; includeTest?: boolean } = {}) {
		let notifications = this.notifications.values();

		if (!options.includeTest) {
			notifications = notifications.filter((n) => !n.test);
		}

		if (options.select) {
			notifications = notifications.map((n) => pick(n, options.select!));
		}

		return notifications;
	}

	async saveNotification(data: {
		message: string;
		image?: string;
		subscriptionIds: string[];
		test?: boolean;
		buttonTitle?: string;
		buttonLink?: string;
	}) {
		await this.notifications.create({
			message: data.message,
			image: data.image,
			subscriptionIds: data.subscriptionIds,
			test: data.test ? true : undefined,
			buttonTitle: data.buttonTitle,
			buttonLink: data.buttonLink,
		});
	}

	private compareSubscriptions(a: Omit<SubscriptionEntity, "id">, b: Omit<SubscriptionEntity, "id">) {
		return a.endpoint === b.endpoint && a.domain === b.domain && a.userAgent === b.userAgent;
	}
}

export class CachedAirtable<T extends TableId> {
	private logger = new Logger(`CachedAirtable: ${this.tableId}`);

	private refreshSubscription: NodeJS.Timeout | null = null;

	private readonly cache = new Map<string, TableRecord<T>>();
	private readonly table = this.base.table(this.tableConfig.id);

	constructor(
		private readonly tableId: T,
		private readonly tableConfig: Config["airtable"]["tables"][T],
		private readonly base: Airtable.Base,
		private readonly options: { ttl?: number } = {},
	) {
		this.refresh().catch((e) => this.logger.error(`Failed to refresh data for ${tableId}: ${e}`));
	}

	get(id: string) {
		return clone(this.cache.get(id));
	}

	keys() {
		return Array.from(this.cache.keys());
	}

	values() {
		return clone(Array.from(this.cache.values()));
	}

	has(id: string): boolean {
		return this.cache.has(id);
	}

	some(predicate: (value: TableRecord<T>) => boolean) {
		return Array.from(this.cache.values()).some(predicate);
	}

	find(predicate: (value: TableRecord<T>) => boolean) {
		for (const value of this.cache.values()) {
			if (predicate(value)) return clone(value);
		}
		return null;
	}

	filter(predicate: (value: TableRecord<T>) => boolean) {
		return clone(Array.from(this.cache.values()).filter(predicate));
	}

	async create(data: Omit<TableRecord<T>, "id">): Promise<TableRecord<T>> {
		const airtableData = this.mapRecordToAirtable(data);

		this.logger.debug(`Creating record`);
		const recordId = await this.table.create(airtableData).then((r) => r.getId());

		await this.refresh();

		return this.get(recordId)!;
	}

	async update(key: TableRecord<T>["id"], update: Partial<Omit<TableRecord<T>, "id">>) {
		const oldData = this.cache.get(key);
		if (!oldData) throw new NotFoundException(`Record not found`);

		if (this.deepCompareRecords(oldData, { ...oldData, ...update })) return clone(oldData);

		const airtableData = this.mapRecordToAirtable(update);

		this.logger.debug(`Updating record ${key}`);
		await this.table.update(key, airtableData);
		this.cache.set(key, { ...oldData, ...update, id: key } as TableRecord<T>);

		return clone(this.cache.get(key)!);
	}

	async remove(key: TableRecord<T>["id"]) {
		const oldData = this.cache.get(key);
		if (!oldData) throw new NotFoundException(`Record not found`);

		this.logger.debug(`Removing record ${key}`);
		await this.table.destroy(key);
		this.cache.delete(key);
	}

	async refresh() {
		if (this.refreshSubscription) clearTimeout(this.refreshSubscription);

		const tableId = this.tableConfig.id;
		const records = await this.base.table(tableId).select({ returnFieldsByFieldId: true }).all();
		const data = this.mapAirtableToRecords(records);

		this.logger.verbose(`Loaded ${data.length} records`);

		this.cache.clear();
		for (const item of data) {
			this.cache.set(item.id, item);
		}

		if (this.options.ttl) {
			this.refreshSubscription = setTimeout(() => this.refresh(), this.options.ttl * 1000);
		}
	}

	private mapAirtableToRecords(records: AirtableRecords<FieldSet>) {
		return records.map((record) => this.mapAirtableToRecord(record));
	}

	private mapAirtableToRecord(record: AirtableRecord<FieldSet>): TableRecord<T> {
		const fields = this.tableConfig.fields;

		const mapped = {} as TableRecord<T>;

		for (const [key, fieldId] of Object.entries(fields)) {
			mapped[key as TableFields<T>] = serializeAirtableValue(record.get(fieldId)) as any;
		}

		return { ...mapped, id: record.id };
	}

	private mapRecordToAirtable(record: Partial<Omit<TableRecord<T>, "id">>) {
		const fields = this.tableConfig.fields;

		const mapped = {} as FieldSet;

		for (const [key, fieldId] of Object.entries(fields)) {
			const value = record[key as keyof Partial<Omit<TableRecord<T>, "id">>];
			if (value) mapped[fieldId as string] = record[key as TableFields<T>];
		}

		return mapped;
	}

	private deepCompareRecords(a: TableRecord<T>, b: TableRecord<T>) {
		return JSON.stringify(a) === JSON.stringify(b);
	}
}
