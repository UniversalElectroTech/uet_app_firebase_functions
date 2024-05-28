import { Timestamp } from "firebase-admin/firestore";

export function isTokenValid(expirationTime: Timestamp): boolean {
	const currentTime = Timestamp.now();

	// Compare current time with expiration time
	return currentTime.toMillis() < expirationTime.toMillis();
}
