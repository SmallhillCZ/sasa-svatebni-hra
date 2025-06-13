import { Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import {
	BehaviorSubject,
	combineLatest,
	distinctUntilChanged,
	distinctUntilKeyChanged,
	filter,
	firstValueFrom,
	switchMap,
} from "rxjs";
import { Logger } from "src/logger";
import { SDK } from "src/sdk";
import { LocalStorageService } from "./local-storage.service";
import { SubscriptionsService } from "./subscriptions.service";

@Injectable({
	providedIn: "root",
})
export class RsvpService {
	private readonly logger = new Logger("RsvpService");

	readonly rsvpId: BehaviorSubject<string | null>;
	readonly rsvp = new BehaviorSubject<SDK.RsvpResponseDto | null>(null);

	constructor(
		private readonly api: SDK,
		readonly route: ActivatedRoute,
		private subscriptionsService: SubscriptionsService,
		private localStorage: LocalStorageService,
	) {
		this.rsvpId = new BehaviorSubject<string | null>(this.localStorage.get("rsvpId") ?? null);

		// load rsvp if id is present
		this.rsvpId
			.pipe(distinctUntilChanged())
			.pipe(switchMap((rsvpId) => this.loadRsvp(rsvpId)))
			.subscribe(this.rsvp);

		this.rsvp.subscribe((rsvp) => this.logger.log("Loaded RSVP:", rsvp));

		// link current subscriptions to rsvp
		combineLatest([
			this.subscriptionsService.subscriptions
				.pipe(filter((subs) => subs.length > 0))
				.pipe(distinctUntilKeyChanged("length")),
			this.rsvp.pipe(filter((rsvp) => !!rsvp)).pipe(distinctUntilKeyChanged("id")),
		]).subscribe(([subs, rsvp]) => this.updateRsvp(rsvp.id, { subscriptions: subs }));
	}

	async ensureRsvpId() {
		let rsvpId = await firstValueFrom(this.rsvpId);

		if (rsvpId) return rsvpId;

		const rsvp = await this.api.RSVPApi.createRsvp({}).then((res) => res.data);

		this.rsvpId.next(rsvp.id);
		this.localStorage.set("rsvpId", rsvp.id);

		return rsvp.id;
	}

	async updateRsvp(rsvpId: string, data: SDK.UpdateRsvpBodyDto) {
		const rsvp = await this.api.RSVPApi.updateRsvp(rsvpId, data).then((res) => res.data);
		this.rsvp.next(rsvp);
	}

	private async loadRsvp(rsvpId: string | null) {
		if (!rsvpId) return null;

		return await this.api.RSVPApi.getRsvp(rsvpId)
			.then((res) => res.data)
			.catch(() => null);
	}
}
