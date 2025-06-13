import { Logger, NestApplicationOptions, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { Config, StaticConfig } from "./config";
import { registerOpenAPI } from "./openapi";

async function bootstrap() {
	const logger = new Logger("MAIN");

	const nestOptions: NestApplicationOptions = {
		logger:
			StaticConfig.logging.debug || StaticConfig.environment === "development"
				? ["log", "error", "warn", "debug", "verbose"]
				: ["log", "error", "warn"],
	};

	const app = await NestFactory.create<NestExpressApplication>(AppModule, nestOptions);

	const config = app.get(Config);

	// global prefix for all controller routes does not affect ServeStaticModule or OpenAPI
	if (config.server.globalPrefix) {
		app.setGlobalPrefix(config.server.globalPrefix);
	}

	if (config.server.cors) {
		app.enableCors();
	}

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	);

	// comment to disable OpenAPI and Swagger
	registerOpenAPI("api", app, config);

	await app.listen(config.server.port, config.server.host);

	logger.log(`Server running on http://${config.server.host}:${config.server.port}`);
}
bootstrap();
