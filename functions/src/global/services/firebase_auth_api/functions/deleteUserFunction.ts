import { getAuth } from "firebase-admin/auth";
import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { isAdmin } from "../../../firebaseFunctions/isAdmin";
import { getFirestore } from "firebase-admin/firestore";

// returns all employees in Simpro
export async function deleteUser(request: CallableRequest) {
	// Check that the user is authenticated.
	if (!request.auth) {
		// Throwing an HttpsError so that the client gets the error details.
		throw new HttpsError(
			"failed-precondition",
			"The function must be " + "called while authenticated."
		);
	}
	const { firebaseUserId }: { firebaseUserId: string } = request.data;

	// Check if all required parameters have been received
	if (!firebaseUserId) {
		throw new HttpsError(
			"failed-precondition",
			"Required parameters are missing."
		);
	}
	// Check if user is admin
	if (!isAdmin(request.auth.uid)) {
		throw new HttpsError(
			"failed-precondition",
			"User is not authenticated for this action."
		);
	}
	try {
		// Update firestore user to account deleted
		await getFirestore()
			.collection("app_users")
			.doc(firebaseUserId)
			.set({ isAccountDeleted: true, securityGroup: "" }, { merge: true });

		getAuth().deleteUser(firebaseUserId);
	} catch (error: any) {
		if (error instanceof Error) {
			// Handle standard errors
			throw new HttpsError("internal", error.message || "An error occurred");
		} else {
			throw error;
		}
	}
}
