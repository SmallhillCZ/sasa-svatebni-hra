import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AdminComponent } from "./pages/admin/admin.component";
import { InfoComponent } from "./pages/info/info.component";
import { NotificationsComponent } from "./pages/notifications/notifications.component";
import { RsvpComponent } from "./pages/rsvp/rsvp.component";

const routes: Routes = [
	{ path: "info", component: InfoComponent },
	{ path: "rsvp", component: RsvpComponent },
	{ path: "notifikace", component: NotificationsComponent },
	{ path: "admin", component: AdminComponent },
	{ path: "", redirectTo: "info", pathMatch: "full" },
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
