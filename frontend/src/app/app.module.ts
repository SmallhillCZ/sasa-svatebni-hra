import { inject, isDevMode, NgModule, provideAppInitializer } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { ServiceWorkerModule } from "@angular/service-worker";
import { IonicModule } from "@ionic/angular";
import { SDK } from "src/sdk";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { ButtonComponent } from "./components/button/button.component";
import { IosInstallPromptComponent } from "./components/ios-install-prompt/ios-install-prompt.component";
import { NotificationsPromptComponent } from "./components/notifications-prompt/notifications-prompt.component";
import { AdminComponent } from "./pages/admin/admin.component";
import { HelpComponent } from "./pages/help/help.component";
import { HistoryComponent } from "./pages/history/history.component";
import { HomeComponent } from "./pages/home/home.component";
import { ConfigService } from "./services/config.service";

@NgModule({
	declarations: [
		AppComponent,
		ButtonComponent,
		IosInstallPromptComponent,
		NotificationsPromptComponent,
		AdminComponent,
		HelpComponent,
		HistoryComponent,
		HomeComponent,
	],
	imports: [
		AppRoutingModule,
		BrowserModule,
		FormsModule,
		ReactiveFormsModule,
		ServiceWorkerModule.register("ngsw-worker.js", {
			enabled: true,
			// enabled: !isDevMode(),
			// Register the ServiceWorker as soon as the application is stable
			// or after 30 seconds (whichever comes first).
			registrationStrategy: "registerWhenStable:30000",
		}),
		IonicModule.forRoot({}),
	],
	bootstrap: [AppComponent],
	providers: [
		provideAppInitializer(() => {
			const configService = inject(ConfigService);
			return configService.loadConfig();
		}),
		{
			provide: SDK,
			useFactory: () => new SDK({ basePath: isDevMode() ? "http://localhost:3000/" : "/" }),
		},
	],
})
export class AppModule {}
