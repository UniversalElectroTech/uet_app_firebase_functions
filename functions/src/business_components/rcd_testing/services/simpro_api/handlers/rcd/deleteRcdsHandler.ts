import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import admin = require("firebase-admin");
import { handleAxiosError } from "../../../../../../global/services/helper_functions/errorHandling";

export async function deleteRcdsHandler(request: CallableRequest) {
	// Check that the user is authenticated.
	if (!request.auth) {
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	try {
		const { jobDocId, dbDocId, rcds } = request.data;

		// Check if all required parameters have been received
		if (!jobDocId || !dbDocId || !Array.isArray(rcds)) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		const batch = admin.firestore().batch();

		rcds.forEach((firebaseDocId) => {
			const rcdDocRef = admin
				.firestore()
				.collection("rcd_test_jobs")
				.doc(jobDocId)
				.collection("distribution_boards")
				.doc(dbDocId)
				.collection("rcds")
				.doc(firebaseDocId);
			batch.delete(rcdDocRef);
		});

		await batch.commit();
		return { success: true };
	} catch (error) {
		return handleAxiosError(error);
	}
}
