export class Logger {
	constructor(private prefix: string) {
		this.prefix = prefix.replace(/^_/, "");
	}

	log(message: unknown, ...args: unknown[]) {
		this.writeConsole("log", message, args);
	}

	debug(message: unknown, ...args: unknown[]) {
		this.writeConsole("debug", message, args);
	}

	error(message: unknown, ...args: unknown[]) {
		this.writeConsole("error", message, args);
	}

	private writeConsole(method: "log" | "debug" | "error", message: unknown, args: unknown[]) {
		const prefix = `[${this.prefix}] `;

		if (typeof message === "string") {
			console[method](`${prefix}${message}`, ...args);
		} else {
			console[method](prefix, message, ...args);
		}
	}
}
