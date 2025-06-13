import { Component, OnInit } from "@angular/core";
import { LocalStorageService } from "src/app/services/local-storage.service";
import { SDK } from "src/sdk";

@Component({
	selector: "app-notifications",
	standalone: false,

	templateUrl: "./notifications.component.html",
	styleUrl: "./notifications.component.scss",
})
export class NotificationsComponent implements OnInit {
	notifications: SDK.ListNotificationsResponseDto[] = [];

	isAdmin = !!this.localStorage.get("admin");

	showTestNotifications = false;

	constructor(
		private readonly sdk: SDK,
		private readonly localStorage: LocalStorageService,
	) {}

	ngOnInit(): void {
		this.loadNotifications();
	}

	async loadNotifications() {
		this.notifications = await this.sdk.NotificationsApi.listNotifications({
			includeTest: this.isAdmin,
		}).then((res) => res.data);

		this.notifications.sort((a, b) => {
			return a.createdAt && b.createdAt ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : 0;
		});
	}

	formatDate(dateString?: string) {
		if (!dateString) return "";

		const date = new Date(dateString);

		let output = `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`;

		if (date.toDateString() !== new Date().toDateString()) {
			output += `, ${date.getDate()}. ${date.getMonth() + 1}.`;
		}

		return output;
	}
}
