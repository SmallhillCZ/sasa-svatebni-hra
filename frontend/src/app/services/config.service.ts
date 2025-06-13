import { Injectable } from "@angular/core";
import axios from "axios";
import { IsString, validateOrReject } from "class-validator";
import { BehaviorSubject } from "rxjs";

class Config {
	@IsString() vapidPublicKey!: string;
	@IsString() adminLogin!: string;
}

@Injectable({
	providedIn: "root",
})
export class ConfigService {
	configUrl = "/config.json";

	// config is loaded using app initializer so will be available immediately
	config = new BehaviorSubject<Config>({} as Config);

	constructor() {}

	async loadConfig() {
		const response = await axios.get(this.configUrl);

		const config = Object.assign(new Config(), response.data);

		await validateOrReject(config);

		this.config.next(config);
	}
}
