export function clone<T>(value: T): T {
	return JSON.parse(JSON.stringify(value));
}

export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
	const result: any = {};
	for (const key of keys) {
		result[key] = obj[key];
	}
	return result;
}
