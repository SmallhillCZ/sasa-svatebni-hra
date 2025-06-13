import { Injectable } from "@angular/core";
import { SwPush } from "@angular/service-worker";
import {
	BehaviorSubject,
	concat,
	defer,
	filter,
	fromEvent,
	map,
	merge,
	Observable,
	of,
	Subject,
	switchMap,
} from "rxjs";
import { Logger } from "src/logger";
import { ConfigService } from "./config.service";

export type NotificationsStatus = "granted" | "error" | "pending";

@Injectable({
	providedIn: "root",
})
export class NotificationsService {
	private logger = new Logger("NotificationsService");

	pushEnabled: boolean;
	notificationsStatus = new BehaviorSubject<PermissionState | null>(this.getNotificationStatus());
	pushSubscription = new BehaviorSubject<PushSubscription | null>(null);
	pushError = new BehaviorSubject<Error | null>(null);

	constructor(
		private readonly swPush: SwPush,
		private readonly configService: ConfigService,
	) {
		// TODO: There is a problem with this not emitting after a hard reload https://github.com/angular/angular/issues/48702
		// this is a hacky way to fix this. At some point reevaluate this solution
		this.fixSwPush();

		this.pushEnabled = swPush.isEnabled;

		swPush.subscription.subscribe(this.pushSubscription);

		this.watchNotifications();
	}

	async enableNotifications() {
		try {
			console.log("Requesting subscription", this.configService.config.value.vapidPublicKey);
			await this.swPush.requestSubscription({
				serverPublicKey: this.configService.config.value.vapidPublicKey,
			});

			this.notificationsStatus.next(this.getNotificationStatus());
		} catch (err: unknown) {
			this.pushError.next(err as Error);
			this.logger.error(err);
		}
	}

	private getNotificationStatus(): PermissionState | null {
		if (!("Notification" in window)) return null;

		if (Notification.permission === "default") return "prompt";
		else return Notification.permission;
	}

	private async watchNotifications() {
		if (!("permissions" in navigator)) return;

		const notificationPerm = await navigator.permissions.query({ name: "notifications" });

		notificationPerm.addEventListener("change", () => this.notificationsStatus.next(notificationPerm.state));
	}

	/**
	 * From https://github.com/angular/angular/issues/48702#issuecomment-1912112624
	 */
	private fixSwPush(): void {
		if (!this.swPush.isEnabled) {
			return;
		}

		const serviceWorker: ServiceWorkerContainer | undefined = this.swPush?.["sw"]?.["serviceWorker"];

		if (!serviceWorker) {
			return;
		}

		// Adapted from original code:
		// https://github.com/angular/angular/blob/c3b00959659ca20d3f798820dfcb4dee250a32ac/packages/service-worker/src/low_level.ts#L137
		const controllerChangeEvents = fromEvent(serviceWorker, "controllerchange");
		const controllerChanges = controllerChangeEvents.pipe(map(() => serviceWorker.controller));
		const currentController = defer(() => of(serviceWorker.controller));

		const registration = concat(
			// The actual fix, here we don't do the falsy filtering for the currentController (as it is null on a hard refresh)
			currentController,
			controllerChanges.pipe(filter((c): c is ServiceWorker => !!c)),
		).pipe(
			// Instead just try to get the ServiceWorkerRegistration here
			switchMap(() => serviceWorker.getRegistration()),
			// And filter out any falsy ServiceWorkerRegistration at the end
			filter((swr): swr is ServiceWorkerRegistration => !!swr),
		);

		// Adapted from original code:
		// https://github.com/angular/angular/blob/c3b00959659ca20d3f798820dfcb4dee250a32ac/packages/service-worker/src/push.ts#L151
		const pushManager = registration.pipe(map((registration) => registration.pushManager));

		// Overwrite the original pushManager
		this.swPush["pushManager"] = pushManager;

		const workerDrivenSubscriptions = pushManager.pipe(switchMap((pm) => pm.getSubscription()));

		// Overwrite the original subscriptionChanges
		(this.swPush.subscription as Observable<PushSubscription | null>) = merge(
			workerDrivenSubscriptions,
			this.swPush["subscriptionChanges"] as Subject<PushSubscription | null>,
		);
	}
}
