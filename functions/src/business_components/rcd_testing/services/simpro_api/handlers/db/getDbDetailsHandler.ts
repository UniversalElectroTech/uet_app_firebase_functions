import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import admin = require("firebase-admin");
import { handleAxiosError } from "../../../../../../global/services/helper_functions/errorHandling";

export async function getDbDetailsHandler(request: CallableRequest) {
	// Check that the user is authenticated.
	if (!request.auth) {
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	try {
		const { jobDocId, dbDocId } = request.data;

		// Check if all required parameters have been received
		if (!jobDocId || !dbDocId) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		const dbDocRef = admin
			.firestore()
			.collection("rcd_test_jobs")
			.doc(jobDocId)
			.collection("distribution_boards")
			.doc(dbDocId);

		const docSnapshot = await dbDocRef.get();
		if (!docSnapshot.exists) {
			return null; // Distribution board not found
		}

		return { ...docSnapshot.data(), docId: dbDocId }; // Return the distribution board data
	} catch (error) {
		return handleAxiosError(error);
	}
}
