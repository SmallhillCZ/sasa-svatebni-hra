import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { BasicStrategy, BasicStrategyOptions, BasicVerifyFunctionWithRequest } from "passport-http";
import { Config } from "src/config";

@Injectable()
export class BasicAuthStrategy extends PassportStrategy(BasicStrategy, "basic-auth") {
	constructor(private config: Config) {
		const options: BasicStrategyOptions<true> = {
			passReqToCallback: true,
		};

		const verify: BasicVerifyFunctionWithRequest = (req, userid, password, done) => {
			if (userid == this.config.auth.userid && password && password == this.config.auth.password) {
				return done(null, { userid: userid });
			} else {
				return done(null, false);
			}
		};

		super(options, verify);
	}
}
