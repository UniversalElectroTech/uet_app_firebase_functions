import { getFirestore } from "firebase-admin/firestore";
import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { isAdmin } from "../../../firebaseFunctions/isAdmin";

// returns all employees in Simpro
export async function deleteUserInvite(request: CallableRequest) {
	// Check that the user is authenticated.
	if (!request.auth) {
		// Throwing an HttpsError so that the client gets the error details.
		throw new HttpsError(
			"failed-precondition",
			"The function must be " + "called while authenticated."
		);
	}
	const { simproId }: { simproId: string } = request.data;

	// Check if all required parameters have been received
	if (!simproId) {
		throw new HttpsError(
			"failed-precondition",
			"Required parameters are missing."
		);
	}

	// Check if user is admin
	if (!(await isAdmin(request.auth.uid))) {
		throw new HttpsError(
			"failed-precondition",
			"User is not authenticated for this action."
		);
	}

	try {
		await getFirestore().collection("app_invites").doc(simproId).delete();
	} catch (error: any) {
		if (error instanceof Error) {
			// Handle standard errors
			throw new HttpsError("internal", error.message || "An error occurred");
		} else {
			throw error;
		}
	}
}
