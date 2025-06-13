import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { BasicAuth } from "src/auth/basic-auth.decorator";
import {
	ListNotificationsQueryDto,
	ListNotificationsResponseDto,
	SendNotificationBodyDto,
} from "src/dto/notifications.dto";
import { DatabaseService } from "src/services/database.service";
import { NotificationsService } from "src/services/notifications.service";

@Controller("notifications")
export class NotificationsController {
	constructor(
		private readonly notificationsService: NotificationsService,
		private readonly databaseService: DatabaseService,
	) {}

	@Get()
	async listNotifications(@Query() query: ListNotificationsQueryDto): Promise<ListNotificationsResponseDto[]> {
		const notifications = await this.databaseService.listNotifications({
			select: ["id", "message", "createdAt", "test", "buttonTitle", "buttonLink"],
			includeTest: query.includeTest === "true",
		});

		return notifications as ListNotificationsResponseDto[];
	}

	@BasicAuth()
	@Post()
	async sendNotification(@Body() body: SendNotificationBodyDto /*@UploadedFile() file: Express.Multer.File*/) {
		await this.notificationsService.sendNotification(
			{
				message: body.message,
				buttonTitle: body.buttonTitle,
				buttonLink: body.buttonLink,
			},
			{
				test: body.test === "true",
			},
		);
	}
}
