import { Component } from "@angular/core";
import { Platform } from "@ionic/angular";
import { InstallationService } from "src/app/services/installation.service";
import { SubscriptionsService } from "src/app/services/subscriptions.service";
import { EmailFormData } from "../email-form/email-form.component";

@Component({
	selector: "app-notifications-prompt",
	standalone: false,

	templateUrl: "./notifications-prompt.component.html",
	styleUrl: "./notifications-prompt.component.scss",
})
export class NotificationsPromptComponent {
	constructor(
		public readonly subscriptionsService: SubscriptionsService,
		public readonly installationService: InstallationService,
		public readonly platform: Platform,
	) {}

	async saveEmail(data: EmailFormData) {
		await this.subscriptionsService.saveEmail(data.email);
	}
}
