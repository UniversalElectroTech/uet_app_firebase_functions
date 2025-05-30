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

		const rcds = await getDbRcds(jobDocId, dbDocId);

		return rcds;
	} catch (error) {
		return handleAxiosError(error);
	}
}

export async function getDbRcds(jobDocId: string, dbDocId: string) {
	const rcdsCollection = admin
		.firestore()
		.collection("rcd_test_jobs")
		.doc(jobDocId)
		.collection("distribution_boards")
		.doc(dbDocId)
		.collection("rcds");

	// Fetching RCDs sorted by orderId directly from Firestore
	const querySnapshot = await rcdsCollection.orderBy("orderId").get();
	const rcds: any[] = querySnapshot.docs.map((doc) => {
		const rcdData = doc.data();
		return { ...rcdData, firebaseDocId: doc.id }; // Include the document ID
	});

	return rcds;
}
