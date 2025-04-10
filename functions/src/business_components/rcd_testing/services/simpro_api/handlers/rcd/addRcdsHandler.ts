import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import admin = require("firebase-admin");
import { handleAxiosError } from "../../../../../../global/services/helper_functions/errorHandling";

export async function addRcdsHandler(request: CallableRequest) {
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
		const rcdCollectionRef = admin
			.firestore()
			.collection("rcd_test_jobs")
			.doc(jobDocId)
			.collection("distribution_boards")
			.doc(dbDocId)
			.collection("rcds");

		const addedRcds: any[] = []; // To store added RCDs

		rcds.forEach((rcd) => {
			const { docId, ...rcdWithoutId } = rcd; // Remove docId from rcd
			const rcdDocRef = rcdCollectionRef.doc(); // Create a new document reference
			batch.set(rcdDocRef, rcdWithoutId); // Use rcd without docId
			addedRcds.push({ ...rcdWithoutId, docId: rcdDocRef.id }); // Store the added RCD with its ID
		});

		await batch.commit();
		return { addedRcds }; // Return the added RCDs
	} catch (error) {
		return handleAxiosError(error);
	}
}
