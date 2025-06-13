import { Injectable } from "@angular/core";
import { Platform } from "@ionic/angular";
import { BehaviorSubject, distinctUntilKeyChanged, filter } from "rxjs";
import { Logger } from "src/logger";
import { SDK } from "src/sdk";
import { InstallationService } from "./installation.service";
import { LocalStorageService } from "./local-storage.service";
import { NotificationsService } from "./notifications.service";

export type SubscriptionStatus =
	| "ready"
	| "success"
	| "denied"
	| "inAppBrowser"
	| "working"
	| "error"
	| "emailSaved"
	| "notAvailable";

@Injectable({
	providedIn: "root",
})
export class SubscriptionsService {
	private readonly logger = new Logger("SubscriptionsService");

	readonly emailSaved: BehaviorSubject<string | null>;

	readonly pushSaved = new BehaviorSubject<boolean>(false);

	readonly notificationsStatus: BehaviorSubject<PermissionState | null>;

	readonly status = new BehaviorSubject<SubscriptionStatus>("ready");

	readonly subscriptions: BehaviorSubject<string[]>;

	constructor(
		private readonly notificationsService: NotificationsService,
		private readonly localStorage: LocalStorageService,
		private readonly installationService: InstallationService,
		private readonly api: SDK,
		private platform: Platform,
	) {
		this.subscriptions = new BehaviorSubject(localStorage.get("subscriptions") ?? []);
		this.emailSaved = new BehaviorSubject(this.localStorage.get("notification-email") ?? null);
		this.notificationsStatus = notificationsService.notificationsStatus;

		notificationsService.pushSubscription
			.pipe(filter((sub) => !!sub))
			.pipe(distinctUntilKeyChanged("endpoint"))
			.subscribe((sub) => this.grantedPush(sub));

		notificationsService.pushError.pipe(filter((err) => !!err)).subscribe((err) => this.status.next("error"));
	}

	async saveEmail(email: string) {
		// reset status
		this.status.next("working");

		// optimistic update
		this.emailSaved.next(email);

		try {
			await this.api.EmailsApi.saveEmail({ email });

			// save email to localstorage so we can tell user email is saved next time
			this.localStorage.set("notification-email", email);
			this.status.next("emailSaved");
		} catch (err: unknown) {
			// rollback optimistic update
			this.emailSaved.next(null);

			this.status.next("error");
			this.logger.error(err);
		}
	}

	async savePush() {
		// notifications are not available on this device
		if (!this.notificationsService.pushEnabled) {
			this.status.next("notAvailable");
			return;
		}

		// user denied notifications, nothing we can do
		if (this.notificationsService.notificationsStatus.value === "denied") {
			this.status.next("denied");
			return;
		}

		const isInAppBrowser = window.navigator.userAgent.match(/(Instagram|FBAN|FBAV)/);

		// user is in app browser like instagram, we can't show notifications
		if (isInAppBrowser) {
			this.status.next("inAppBrowser");
			return;
		}

		// iOS — without adding to homescreen, notifications will silently fail
		if (this.platform.is("ios") && !this.installationService.installed.value) {
			if (this.installationService.installAvailable.value) {
				this.installationService.showIosInstall();
				return;
			} else {
				this.status.next("notAvailable");
				return;
			}
		}

		// request notifications permission, grantedPush will be called if user accepts
		await this.notificationsService.enableNotifications();
	}

	private async grantedPush(pushSubscription: PushSubscription) {
		try {
			this.status.next("working");

			const subscriptionData = pushSubscription.toJSON() as any as SDK.PushSubscriptionDto;

			const subscription = await this.api.SubscriptionsApi.saveSubscription(subscriptionData).then((res) => res.data);

			const subscriptions = Array.from(new Set([...this.subscriptions.value, subscription.id]));

			this.localStorage.set("subscriptions", subscriptions);

			this.pushSaved.next(true);
			this.subscriptions.next(subscriptions);
			this.status.next("success");
		} catch (err: unknown) {
			this.status.next("error");
			this.logger.error(err);
		}
	}
}
