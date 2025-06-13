import { Component, Input } from "@angular/core";

@Component({
	selector: "app-button",
	standalone: false,

	templateUrl: "./button.component.html",
	styleUrl: "./button.component.scss",
})
export class ButtonComponent {
	@Input() type: "button" | "submit" | "reset" = "button";
	@Input() color:
		| "primary"
		| "secondary"
		| "tertiary"
		| "success"
		| "warning"
		| "danger"
		| "light"
		| "medium"
		| "dark"
		| "transparent" = "primary";

	@Input() size?: "small" | "default" | "large" = "default";
	@Input() href?: string;
	@Input() target?: string;

	onClick(event: MouseEvent) {
		if (this.href) {
			if (this.target === "_blank") {
				window.open(this.href, "_blank");
			} else {
				window.location.href = this.href;
			}

			event.stopPropagation();
			event.preventDefault();
		}
	}
}
