import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { Config } from "src/config";
import { BasicAuthStrategy } from "./basic-auth.strategy";

@Module({
	imports: [PassportModule],
	providers: [Config, BasicAuthStrategy],
})
export class AuthModule {}
