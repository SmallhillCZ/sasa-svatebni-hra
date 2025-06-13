import { Injectable } from "@angular/core";

@Injectable({
	providedIn: "root",
})
export class LocalStorageService {
	constructor() {}

	get(key: string) {
		return JSON.parse(window.localStorage.getItem(key) || "null");
	}

	set(key: string, value: any) {
		window.localStorage.setItem(key, JSON.stringify(value));
	}

	remove(key: string) {
		window.localStorage.removeItem(key);
	}
}
