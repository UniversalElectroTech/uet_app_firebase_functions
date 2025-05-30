import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import admin = require("firebase-admin");
import { handleAxiosError } from "../../../../../../global/services/helper_functions/errorHandling";
import { getDbRcds } from "../rcd/getDbRcdsHandler";

export async function getDbsHandler(request: CallableRequest) {
	// Check that the user is authenticated.
	if (!request.auth) {
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	try {
		const { jobDocId } = request.data;

		// Check if all required parameters have been received
		if (!jobDocId) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		return await getDbs(jobDocId);
	} catch (error) {
		return handleAxiosError(error);
	}
}

export async function getDbs(jobDocId: string) {
	const distributionBoardsCollection: any = admin
		.firestore()
		.collection("rcd_test_jobs")
		.doc(jobDocId)
		.collection("distribution_boards");

	const querySnapshot = await distributionBoardsCollection.get();
	const distributionBoards = await Promise.all(
		querySnapshot.docs.map(async (doc: any) => {
			const dbData = { ...doc.data(), firebaseDocId: doc.id };

			// Collect RCDs for each distribution board
			const rcds = await getDbRcds(jobDocId, doc.id);

			// Add rcds to the distribution board object
			return { ...dbData, rcds };
		})
	);

	// Sorting the distribution boards based on orderId
	distributionBoards.sort((a, b) => a.orderId - b.orderId);

	return distributionBoards;
}
