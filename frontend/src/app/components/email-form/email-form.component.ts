import { Component, EventEmitter, Output } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";

export interface EmailFormData {
	email: string;
}

@Component({
	selector: "app-email-form",
	standalone: false,

	templateUrl: "./email-form.component.html",
	styleUrl: "./email-form.component.scss",
})
export class EmailFormComponent {
	@Output() submit = new EventEmitter<EmailFormData>();

	form = new FormGroup({
		email: new FormControl("", { nonNullable: true }),
	});

	onSubmit() {
		this.submit.emit(this.form.getRawValue());
	}
}
