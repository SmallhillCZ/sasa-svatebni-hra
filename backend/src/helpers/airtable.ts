import { FieldSet } from "airtable";

export function serializeAirtableRecord(record: FieldSet) {
	const serialized = {} as Record<string, string | string[]>;

	for (const [key, value] of Object.entries(record)) {
		const serializedValue = serializeAirtableValue(value);
		if (serializedValue !== undefined) serialized[key] = serializedValue;
	}

	return serialized;
}

export function serializeAirtableValue(value: FieldSet[keyof FieldSet]) {
	if (Array.isArray(value)) {
		return value.filter((item) => item !== undefined).map((item) => String(item));
	} else {
		return value !== undefined ? String(value) : undefined;
	}
}
