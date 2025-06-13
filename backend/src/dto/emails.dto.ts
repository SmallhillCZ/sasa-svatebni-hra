import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class SaveEmailDto {
	@ApiProperty() @IsEmail() email!: string;
}
