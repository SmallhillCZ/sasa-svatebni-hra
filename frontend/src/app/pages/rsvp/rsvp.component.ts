import { Component, OnInit } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { RsvpService } from "src/app/services/rsvp.service";

@Component({
	selector: "app-rsvp",
	standalone: false,

	templateUrl: "./rsvp.component.html",
	styleUrl: "./rsvp.component.scss",
})
export class RsvpComponent implements OnInit {
	loading: boolean = true;

	url?: SafeResourceUrl;

	constructor(
		public readonly rsvpService: RsvpService,
		private readonly domSanitizer: DomSanitizer,
	) {}

	ngOnInit(): void {
		this.loadRsvp();
	}

	async loadRsvp() {
		try {
			const rsvpId = await this.rsvpService.ensureRsvpId();
			const url = `https://airtable.com/embed/appShvxODFwWugM8a/pag29xUp6bNWe0rnI/form?prefill_fldC58IADJwT9T1L3=${encodeURIComponent(rsvpId)}&hide_fldC58IADJwT9T1L3=true`;

			this.url = this.domSanitizer.bypassSecurityTrustResourceUrl(url);
		} catch (e) {
			console.error(e);
			const url = `https://airtable.com/embed/appShvxODFwWugM8a/pag29xUp6bNWe0rnI/form?hide_fldC58IADJwT9T1L3=true`;

			this.url = this.domSanitizer.bypassSecurityTrustResourceUrl(url);
		} finally {
			setTimeout(() => {
				this.loading = false;
			}, 3000);
		}
	}
}
