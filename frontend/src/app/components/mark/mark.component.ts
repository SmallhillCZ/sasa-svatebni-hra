import { Component, Input } from "@angular/core";

@Component({
	selector: "app-mark",
	standalone: false,

	templateUrl: "./mark.component.html",
	styleUrl: "./mark.component.scss",
})
export class MarkComponent {
	@Input() set color(color: string) {
		this.backgroundImage = `linear-gradient(to bottom, transparent 60%, ${color} 40%)`;
	}

	backgroundImage: string = `linear-gradient(to bottom, transparent 60%, #f7ed3f 40%)`;
}
