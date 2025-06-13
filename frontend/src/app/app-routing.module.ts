import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AdminComponent } from "./pages/admin/admin.component";
import { HelpComponent } from "./pages/help/help.component";
import { HistoryComponent } from "./pages/history/history.component";
import { HomeComponent } from "./pages/home/home.component";

const routes: Routes = [
	{ path: "", component: HomeComponent },
	{ path: "help", component: HelpComponent },
	{ path: "admin", component: AdminComponent },
	{ path: "history", component: HistoryComponent },
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
