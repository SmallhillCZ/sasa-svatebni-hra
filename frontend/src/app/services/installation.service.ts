import { Injectable } from "@angular/core";
import { Platform, PopoverController } from "@ionic/angular";
import { BehaviorSubject } from "rxjs";
import { IosInstallPromptComponent } from "../components/ios-install-prompt/ios-install-prompt.component";

type UserChoice = Promise<{
	outcome: "accepted" | "dismissed";
	platform: string;
}>;

interface BeforeInstallPromptEvent extends Event {
	readonly platforms: string[];
	readonly userChoice: Promise<UserChoice>;
	prompt(): Promise<UserChoice>;
}

declare global {
	interface WindowEventMap {
		beforeinstallprompt: BeforeInstallPromptEvent;
	}
}

@Injectable({
	providedIn: "root",
})
export class InstallationService {
	public readonly installed: BehaviorSubject<boolean> = new BehaviorSubject(false);
	public readonly installAvailable: BehaviorSubject<boolean>;

	private installPrompt: Promise<BeforeInstallPromptEvent>;

	constructor(
		private readonly platform: Platform,
		private readonly popoverController: PopoverController,
	) {
		// installed = check if app is running in standalone mode
		this.installed.next(this.platform.is("pwa"));

		this.installAvailable = new BehaviorSubject(this.installAvailableOnPlatform());

		this.installPrompt = new Promise((resolve) => {
			window.addEventListener("beforeinstallprompt", (event: BeforeInstallPromptEvent) => {
				// prevent asking the user right away
				event.preventDefault();
				// beforeinstallprompt event is on some platforms fired even when already installed
				this.installAvailable.next(!this.platform.is("pwa"));
				// save the event to the promise to be used later
				resolve(event);
			});
		});
	}

	async showPwaInstall() {
		// wait for the beforeinstallprompt event to get installPrompt
		const installPrompt = await this.installPrompt;

		// show system install prompt
		const result = await installPrompt.prompt();

		this.installed.next(result?.outcome === "accepted");

		// after asking once, prompt is not available anymore
		this.installAvailable.next(false);
	}

	async showIosInstall() {
		const browser = this.getBrowser();

		const browserLocations = {
			safari: [window.innerWidth / 2, window.innerHeight - 5],
			chrome: [window.innerWidth - 5, 5],
			other: [window.innerWidth / 2, window.innerHeight - 5],
		} as const;

		const event: MouseEvent = new MouseEvent("click", {
			clientX: browserLocations[browser][0],
			clientY: browserLocations[browser][1],
		});

		const popover = await this.popoverController.create({
			component: IosInstallPromptComponent,
			reference: "event",
			event,
			cssClass: "popover-wide",
		});

		await popover.present();
	}

	private installAvailableOnPlatform() {
		// if running already as PWA, we can't install it again
		if (this.platform.is("pwa")) return false;

		const browser = this.getBrowser();

		// on ios we install manually so it is "available" from the start, but only in chrome and safari, not brave for example
		if (this.platform.is("ios") && ["safari", "chrome"].includes(browser)) return true;

		// on android and others we wait for beforeinstallprompt event
		return false;
	}

	private getBrowser() {
		if (window.navigator.userAgent.toLowerCase().includes("safari")) return "safari";
		if (window.navigator.userAgent.toLowerCase().includes("chrome")) return "chrome";
		return "other";
	}
}
