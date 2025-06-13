import { applyDecorators, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiSecurity } from "@nestjs/swagger";

export function BasicAuth() {
	return applyDecorators(
		UseGuards(AuthGuard("basic-auth")), // check auth
		ApiSecurity("basic-auth"), // openapi
	);
}
