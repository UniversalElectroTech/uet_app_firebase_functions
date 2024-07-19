import { randomBytes } from "crypto";

export function generateRandomToken(length = 10) {
	const buffer = randomBytes(length);

	return Array.from(buffer, (byte) => byte.toString(16).padStart(2, "0")).join(
		""
	);
}
