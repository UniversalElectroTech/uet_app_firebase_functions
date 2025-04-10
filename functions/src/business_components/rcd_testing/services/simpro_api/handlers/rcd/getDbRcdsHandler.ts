import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import admin = require("firebase-admin");
import { handleAxiosError } from "../../../../../../global/services/helper_functions/errorHandling";

export async function getDbRcdsHandler(request: CallableRequest) {
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

		const rcdsCollection = admin
			.firestore()
			.collection("rcd_test_jobs")
			.doc(jobDocId)
			.collection("distribution_boards")
			.doc(dbDocId)
			.collection("rcds");

		const querySnapshot = await rcdsCollection.get();
		const rcds: any[] = querySnapshot.docs.map((doc) => {
			const rcdData = doc.data();
			return { ...rcdData, docId: doc.id }; // Include the document ID
		});

		// Sorting the RCDs based on orderId
		rcds.sort((a, b) => a.orderId - b.orderId);

		return rcds;
	} catch (error) {
		return handleAxiosError(error);
	}
}
