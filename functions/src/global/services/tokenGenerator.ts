export function generateRandomToken(length = 10) {
	const buffer = new Uint8Array(length);
	crypto.getRandomValues(buffer);
	return Array.from(buffer, (byte) => byte.toString(16).padStart(2, "0")).join(
		""
	);
}
