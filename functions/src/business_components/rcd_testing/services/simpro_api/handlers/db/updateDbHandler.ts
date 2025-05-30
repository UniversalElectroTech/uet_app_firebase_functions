import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import admin = require("firebase-admin");
import { handleAxiosError } from "../../../../../../global/services/helper_functions/errorHandling";

export async function updateDbHandler(request: CallableRequest) {
	// Check that the user is authenticated.
	if (!request.auth) {
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	try {
		const { jobDocId, db } = request.data;

		// Check if all required parameters have been received
		if (!jobDocId || !db) {
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
			.doc(db.firebaseDocId);

		// Remove db.firebaseDocId before updating
		const { firebaseDocId, ...dbWithoutFirebaseDocId } = db; // Remove firebaseDocId from db

		await dbDocRef.update(dbWithoutFirebaseDocId);
		return { success: true };
	} catch (error) {
		return handleAxiosError(error);
	}
}
