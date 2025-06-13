import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { AuthModule } from "./auth/auth.module";
import { Config, ConfigModule } from "./config";
import { AdminController } from "./controllers/admin.controller";
import { NotificationsController } from "./controllers/notifications.controller";
import { SubscriptionsController } from "./controllers/subscriptions.controller";
import { DatabaseService } from "./services/database.service";
import { NotificationsService } from "./services/notifications.service";

@Module({
	imports: [
		ConfigModule,
		ServeStaticModule.forRootAsync({
			inject: [Config],
			useFactory: (config: Config) => [
				{
					rootPath: config.server.publicDir,
					serveRoot: "",
				},
			],
		}),
		AuthModule,
	],
	controllers: [SubscriptionsController, NotificationsController, AdminController],
	providers: [NotificationsService, DatabaseService],
})
export class AppModule {}
