import { Controller, Get } from "@nestjs/common";
import { BasicAuth } from "src/auth/basic-auth.decorator";
import { DatabaseService } from "src/services/database.service";

@Controller("admin")
@BasicAuth()
export class AdminController {
	constructor(private readonly database: DatabaseService) {}

	@Get("refresh")
	async refresh() {
		await this.database.refreshAll();
	}
}
