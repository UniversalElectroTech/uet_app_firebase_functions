import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import admin = require("firebase-admin");
import { handleAxiosError } from "../../../../../../global/services/helper_functions/errorHandling";

export async function createDbHandler(request: CallableRequest) {
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

		const jobDocRef = admin
			.firestore()
			.collection("rcd_test_jobs")
			.doc(jobDocId);

		// Remove db.docId before updating
		const { docId, ...dbWithoutId } = db; // Remove docId from db

		// Add the distribution board to the job document
		const docRef = await jobDocRef
			.collection("distribution_boards")
			.add(dbWithoutId);

		// Retrieve the newly added distribution board document
		const boardData = (await docRef.get()).data();
		return { ...boardData, docId: docRef.id, rcds: [] };
	} catch (error) {
		return handleAxiosError(error);
	}
}
