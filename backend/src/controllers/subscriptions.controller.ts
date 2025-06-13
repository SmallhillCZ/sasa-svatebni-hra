import { Body, Controller, Post, Req } from "@nestjs/common";
import { Request } from "express";
import { PushSubscriptionDto, SubscriptionResponseDto } from "src/dto/subscriptions.dto";
import { DatabaseService } from "src/services/database.service";

@Controller("subscriptions")
export class SubscriptionsController {
	constructor(private readonly database: DatabaseService) {}

	@Post()
	async saveSubscription(@Body() body: PushSubscriptionDto, @Req() req: Request): Promise<SubscriptionResponseDto> {
		const subscription = await this.database.saveSubscription({
			endpoint: body.endpoint,
			subscription: JSON.stringify(body),
			domain: req.headers.host,
			userAgent: req.headers["user-agent"],
		});

		delete subscription.subscription;

		return subscription as SubscriptionResponseDto;
	}
}
