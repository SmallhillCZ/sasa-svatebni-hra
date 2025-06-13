import { Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ConfigService } from "src/app/services/config.service";
import { LocalStorageService } from "src/app/services/local-storage.service";
import { SDK } from "src/sdk";

@Component({
	selector: "app-admin",
	standalone: false,

	templateUrl: "./admin.component.html",
	styleUrl: "./admin.component.scss",
})
export class AdminComponent {
	passwordForm = new FormGroup({
		password: new FormControl("", { nonNullable: true }),
	});

	notificationForm = new FormGroup({
		message: new FormControl("", { nonNullable: true, validators: [Validators.required] }),
		buttonTitle: new FormControl("", { nonNullable: true, validators: [] }),
		buttonLink: new FormControl("", { nonNullable: true, validators: [] }),
		test: new FormControl(false, { nonNullable: true, validators: [] }),
	});

	password?: string | null = this.localStorage.get("admin");

	constructor(
		private readonly localStorage: LocalStorageService,
		private readonly sdk: SDK,
		private readonly configService: ConfigService,
	) {}

	savePassword() {
		const formData = this.passwordForm.value;
		this.localStorage.set("admin", formData.password);
		this.password = formData.password;
	}

	deletePassword() {
		this.localStorage.remove("admin");
		this.password = null;
	}

	async sendNotification() {
		if (!this.notificationForm.valid) return;

		const formData = this.notificationForm.getRawValue();

		const data = {
			message: formData.message,
			buttonTitle: formData.buttonTitle,
			buttonLink: formData.buttonLink,
			test: formData.test ? SDK.SendNotificationBodyDtoTestEnum.True : SDK.SendNotificationBodyDtoTestEnum.False,
		};

		await this.sdk.NotificationsApi.sendNotification(data, {
			auth: {
				username: "admin",
				password: this.localStorage.get("admin"),
			},
		});

		this.notificationForm.reset();
	}

	async refreshBackend() {
		await this.sdk.AdminApi.refresh({
			auth: {
				username: "admin",
				password: this.localStorage.get("admin"),
			},
		});
	}
}
