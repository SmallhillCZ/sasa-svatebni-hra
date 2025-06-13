import { Body, Controller, Post } from "@nestjs/common";
import { SaveEmailDto } from "src/dto/emails.dto";
import { DatabaseService } from "src/services/database.service";

@Controller("emails")
export class EmailsController {
	constructor(private database: DatabaseService) {}

	@Post()
	async saveEmail(@Body() body: SaveEmailDto) {
		await this.database.saveEmail(body.email);
	}
}
