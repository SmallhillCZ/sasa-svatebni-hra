import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { AuthModule } from "./auth/auth.module";
import { Config, ConfigModule } from "./config";
import { AdminController } from "./controllers/admin.controller";
import { EmailsController } from "./controllers/emails.controller";
import { NotificationsController } from "./controllers/notifications.controller";
import { RsvpController } from "./controllers/rsvp.controller";
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
	controllers: [RsvpController, SubscriptionsController, NotificationsController, AdminController, EmailsController],
	providers: [NotificationsService, DatabaseService],
})
export class AppModule {}
