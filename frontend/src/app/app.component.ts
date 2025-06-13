import { Component } from "@angular/core";
import { SwUpdate } from "@angular/service-worker";
import { AlertController, Platform } from "@ionic/angular";
import { addIcons } from "ionicons";
import {
	calendarOutline,
	checkboxOutline,
	keyOutline,
	notificationsCircleOutline,
	notificationsOutline,
} from "ionicons/icons";
import { InstallationService } from "./services/installation.service";
import { LocalStorageService } from "./services/local-storage.service";

@Component({
	selector: "app-root",
	standalone: false,

	templateUrl: "./app.component.html",
	styleUrl: "./app.component.scss",
})
export class AppComponent {
	isAdmin = !!this.localStorage.get("admin");

	constructor(
		public readonly installationService: InstallationService,
		private readonly alertController: AlertController,
		private readonly platform: Platform,
		private readonly localStorage: LocalStorageService,
		private readonly swUpdate: SwUpdate,
	) {
		addIcons({ calendarOutline, checkboxOutline, notificationsCircleOutline, notificationsOutline, keyOutline });

		this.checkInAppBrowser();

		this.checkUpdate();
	}

	private async checkInAppBrowser() {
		const isInAppBrowser = window.navigator.userAgent.match(/(Instagram|FBAN|FBAV)/);

		if (!isInAppBrowser) return;

		const alert = await this.alertController.create({
			backdropDismiss: false,
			header: "Svatební hra",
			buttons: [
				{
					text: "Otevřít v prohlížeči",
					handler: () => {
						const domain = window.location.hostname;

						if (this.platform.is("android")) {
							window.location.href = `intent://${domain}#Intent;scheme=https;end` as any;
							return;
						}

						if (this.platform.is("ios")) {
							window.location.href = `x-safari-https://${domain}`;
							return;
						}

						alert.dismiss();
					},
				},
			],
		});

		await alert.present();
	}

	private async checkUpdate() {
		const updateAvailable = await this.swUpdate.checkForUpdate();
		if (updateAvailable) this.showUpdateAlert();
	}

	private async showUpdateAlert() {
		const alert = await this.alertController.create({
			header: "Nová verze",
			message: "Je k dispozici nová verze.",
			buttons: [
				{
					text: "Aktualizovat",
					handler: () => {
						document.location.reload();
					},
				},
				{
					text: "Zrušit",
					role: "cancel",
				},
			],
		});

		await alert.present();
	}
}
