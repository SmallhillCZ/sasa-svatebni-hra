import { Component } from "@angular/core";
import { addIcons } from "ionicons";
import { chevronDownOutline } from "ionicons/icons";

@Component({
	selector: "app-info",
	standalone: false,

	templateUrl: "./info.component.html",
	styleUrl: "./info.component.scss",
})
export class InfoComponent {
	constructor() {
		addIcons({ chevronDownOutline });
	}
}
