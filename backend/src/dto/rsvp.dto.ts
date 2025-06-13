import { IsOptional, IsString } from "class-validator";

export class GetMyRsvpBodyDto {
	@IsString() @IsOptional() inviteId?: string;
	@IsString({ each: true }) @IsOptional() subscriptionId?: string[];
}

export class RsvpResponseDto {
	id!: string;
	name?: string;
	inviteId?: string;
	partner?: string;
	children?: string;
	subscriptions?: string[];
	createdAt!: string;
}

export class CreateRsvpBodyDto {
	@IsOptional() @IsString() name?: string;
	@IsOptional() @IsString() inviteId?: string;
	@IsOptional() @IsString() partner?: string;
	@IsOptional() @IsString() children?: string;
	@IsOptional() @IsString({ each: true }) subscriptions?: string[];
}

export class UpdateRsvpBodyDto extends CreateRsvpBodyDto {}
