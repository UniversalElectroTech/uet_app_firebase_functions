import { getFirestore } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";

export async function isAdmin(firebaseUserId: string) {
	const docSnap = await getFirestore()
		.collection("app_users")
		.doc(firebaseUserId)
		.get();

	if (!docSnap.exists) {
		throw new HttpsError("failed-precondition", "User document is missing.");
	}

	const isAdmin = docSnap.get("securityGroup") == "admin";
	return isAdmin;
}
