import { Injectable, Logger } from "@nestjs/common";
import { mkdirSync } from "fs";
import { Config } from "src/config";
import { PushSubscription, sendNotification, setVapidDetails } from "web-push";
import { DatabaseService } from "./database.service";

export interface NotificationData {
	message: string;
	buttonTitle?: string;
	buttonLink?: string;
	image?: string;
}
export interface NotificationPayload extends NotificationOptions {
	title: string;
	image?: string;
	actions?: { action: string; title: string }[];
}

@Injectable()
export class NotificationsService {
	private readonly logger = new Logger(NotificationsService.name);

	constructor(
		private readonly config: Config,
		private database: DatabaseService,
	) {
		this.logger.log(`VAPID subject: ${config.notifications.vapid.subject}`);
		this.logger.log(`VAPID public key: ${config.notifications.vapid.publicKey}`);
		this.logger.log(`VAPID private key: ${config.notifications.vapid.privateKey}`);
		setVapidDetails(
			config.notifications.vapid.subject,
			config.notifications.vapid.publicKey,
			config.notifications.vapid.privateKey,
		);

		mkdirSync(config.data.dataRoot, { recursive: true });
	}

	async sendNotificationToAll(data: NotificationData, options: { test?: boolean } = {}) {
		let subscriptions = this.database.getSubscriptions();

		let subscriptionIds: string[] = [];

		if (options.test) {
			subscriptions = subscriptions.filter((subscription) => !!subscription.test);
		}

		const notificationPayload: { notification: NotificationPayload } = {
			notification: {
				icon: this.config.notifications.icon,
				badge: this.config.notifications.badge,
				title: this.config.app.name,
				body: data.message,
				image: data.image,
				data: {
					onActionClick: {
						default: { operation: "openWindow", url: "/" },
					},
				},
			},
		};

		if (data.buttonTitle && data.buttonLink) {
			notificationPayload.notification.actions = [{ action: "button", title: data.buttonTitle }];
			notificationPayload.notification.data!.onActionClick.button = {
				operation: "openWindow",
				url: data.buttonLink,
			};
		}

		this.logger.verbose(`Sending notification to ${subscriptions.length} subscriptions`, notificationPayload);

		for (const subscription of subscriptions) {
			try {
				const pushSubscription = this.parseSubscription(subscription.subscription!);

				this.logger.debug(`Sending notification to ${pushSubscription.endpoint}`);

				await sendNotification(pushSubscription, JSON.stringify(notificationPayload));
				subscriptionIds.push(subscription.id);

				this.logger.verbose(`Notification sent to ${pushSubscription.endpoint}`);
			} catch (error) {
				if (
					error &&
					typeof error === "object" &&
					"statusCode" in error &&
					[404, 410].includes(error.statusCode as number)
				) {
					this.logger.warn(`Subscription ${subscription.id} is no longer valid. Removing it.`);
					await this.database.removeSubscription(subscription.id).catch(() => {});
					console.error(error);
				} else {
					this.logger.error("Failed to send notification", error);
					console.error(error);
				}
			}
		}

		await this.database.saveNotification({
			...data,
			subscriptionIds,
			test: options.test,
		});
	}

	async sendNotificationTo(subscription: PushSubscription, message: string) {
		const notificationPayload: { notification: NotificationPayload } = {
			notification: {
				icon: this.config.notifications.icon,
				badge: this.config.notifications.badge,
				title: this.config.app.name,
				body: message,
			},
		};
		try {
			this.logger.debug(`Sending test notification to ${subscription.endpoint}`);
			await sendNotification(subscription, JSON.stringify(notificationPayload));
			this.logger.verbose(`Test notification sent to ${subscription.endpoint}`);
		} catch (error) {
			this.logger.error("Failed to send test notification", error);
			console.error(error);
		}
	}

	parseSubscription(subscription: unknown) {
		try {
			return JSON.parse(String(subscription));
		} catch (error) {
			throw new Error("Failed to parse subscription");
		}
	}
}
