import { Component } from "@angular/core";
import { Platform } from "@ionic/angular";
import { InstallationService } from "src/app/services/installation.service";
import { NotificationsService } from "src/app/services/notifications.service";
import { SubscriptionsService } from "src/app/services/subscriptions.service";
import { SDK } from "src/sdk";

@Component({
	selector: "app-notifications-prompt",
	standalone: false,
	templateUrl: "./notifications-prompt.component.html",
	styleUrl: "./notifications-prompt.component.scss",
})
export class NotificationsPromptComponent {
	testNoficationStatus: "ready" | "sending" | "sent" | "error" = "ready";
	constructor(
		public readonly subscriptionsService: SubscriptionsService,
		public readonly installationService: InstallationService,
		public readonly platform: Platform,
		private readonly sdk: SDK,
		private readonly notificationsService: NotificationsService,
	) {}

	async sendTestNotification() {
		const subscription = this.notificationsService.pushSubscription.value;
		if (!subscription) {
			this.testNoficationStatus = "error";
			return;
		}

		this.testNoficationStatus = "sending";

		await this.sdk.NotificationsApi.sendTestNotification({
			message: "Dojdi si pro drink!",
			subscription,
		});

		this.testNoficationStatus = "sent";
	}
}
