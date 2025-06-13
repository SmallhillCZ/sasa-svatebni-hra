import { Global, Injectable, Module } from "@nestjs/common";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import * as path from "path";

dotenv.config({
	override: true,
	debug: true,
});

const packageJson = JSON.parse(readFileSync(path.join(__dirname, "../package.json"), "utf8"));
const environment = process.env.NODE_ENV || "development";
const logging = {
	debug: process.env.LOG_DEBUG === "true" || process.env.LOG_DEBUG === "1",
};

const server = {
	port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
	host: process.env.HOST || "127.0.0.1",
	publicDir: process.env.PUBLIC_DIR || path.join(__dirname, "../public"),
	cors: environment === "development",
	globalPrefix: "api",
};

const app = {
	baseUrl: process.env.BASE_URL || `http://${server.host}:${server.port}`,
	name: packageJson.displayName,
	email: packageJson.author.email,
};

const dataRoot = process.env.DATA_DIR || "./data";

const data = {
	dataRoot,
	subscriptionsFile: path.join(dataRoot, "subscriptions.jsonl"),
	emailsFile: path.join(dataRoot, "emails.txt"),
};

if (!process.env.VAPID_PUBLIC_KEY) throw new Error("VAPID_PUBLIC_KEY must be set in the environment");
if (!process.env.VAPID_PRIVATE_KEY) throw new Error("VAPID_PRIVATE_KEY must be set in the environment");
if (!(process.env.VAPID_SUBJECT || app.baseUrl)) throw new Error("VAPID_SUBJECT must be set in the environment");

const notifications = {
	icon: `${app.baseUrl}/favicon.webp`,
	badge: `${app.baseUrl}/favicon.webp`,
	vapid: {
		publicKey: process.env.VAPID_PUBLIC_KEY,
		privateKey: process.env.VAPID_PRIVATE_KEY,
		subject: process.env.VAPID_SUBJECT || app.baseUrl,
	},
};

const airtable = {
	apiKey: process.env.AIRTABLE_API_KEY,
	baseId: "app09hDfAelsPUFMb",
	tables: {
		subscriptions: {
			id: "tblAeAJohlWTDjdhi",
			fields: {
				endpoint: "fldMzIC9qasVhWTs4",
				subscription: "fldPvDcoaVJAktFbb",
				source: "fldr8Z7OiOU7J0pPf",
				domain: "fldOQpzO3VPJquD1i",
				userAgent: "fldVj46PoBOe0A24i",
				test: "fldXguKeqKfN60OKg",
			},
		},
		notifications: {
			id: "tblxu02WF1Xbp6HWl",
			fields: {
				message: "fldt9pQPwjqS8Cgvr",
				image: "fldscUaZLwTnaExNC",
				createdAt: "fldkmuAl9aE0SpYhP",
				subscriptionIds: "fld6YiGp82BSMYexr",
				test: "fldeVfGODEfkHQogG",
				buttonTitle: "fldf74oPkN6WzEY6l",
				buttonLink: "fldnV5Um2miMLPdeA",
				sent: "fldMD31zzqE6aAnZi",
			},
		},
	},
};

const auth = {
	userid: process.env.ADMIN_USERNAME,
	password: process.env.ADMIN_PASSWORD,
};

@Injectable()
export class Config {
	airtable = airtable;
	app = app;
	auth = auth;
	environment = environment;
	server = server;
	data = data;
	notifications = notifications;
	logging = logging;
}

@Global()
@Module({ providers: [Config], exports: [Config] })
export class ConfigModule {}

export const StaticConfig = new Config();
