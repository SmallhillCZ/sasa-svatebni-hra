import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsObject, IsOptional, IsString } from "class-validator";
import { TableRecord } from "src/services/database.service";

export class ListNotificationsQueryDto {
	@ApiPropertyOptional({ type: "boolean" }) @IsOptional() includeTest?: string;
}

export class ListNotificationsResponseDto
	implements Pick<TableRecord<"notifications">, "id" | "message" | "createdAt" | "test" | "buttonTitle" | "buttonLink">
{
	id!: string;
	message?: string;
	createdAt?: string;
	test?: boolean;
	buttonTitle?: string;
	buttonLink?: string;
}

export enum NotificationTestEnum {
	TRUE = "true",
	FALSE = "false",
}

export class SendNotificationBodyDto {
	@IsString() message!: string;
	@IsOptional() @IsString() buttonTitle?: string;
	@IsOptional() @IsString() buttonLink?: string;
	@IsOptional() @IsEnum(NotificationTestEnum) test?: NotificationTestEnum;
}

export class SendTestNotificationBodyDto {
	@IsObject() subscription!: any; // This should be a PushSubscription object, but we use 'any' for simplicity
	@IsString() message!: string;
}
