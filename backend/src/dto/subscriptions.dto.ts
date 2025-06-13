import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsObject, IsOptional, IsString } from "class-validator";

export class PushSubscriptionDto {
	@ApiProperty() @IsString() endpoint!: string;
	@ApiPropertyOptional() @IsNumber() @IsOptional() expirationTime?: null | number;
	@ApiProperty() @IsObject() keys!: {
		p256dh: string;
		auth: string;
	};
}

export class SubscriptionResponseDto {
	id!: string;
	endpoint?: string;
	rsvpId?: string;
}
