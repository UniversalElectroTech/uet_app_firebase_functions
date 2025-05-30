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

		const boardData = await addDb(db, jobDocId);

		return boardData;
	} catch (error) {
		return handleAxiosError(error);
	}
}

// add db
export async function addDb(db: any, jobDocId: string) {
	const jobDocRef = admin.firestore().collection("rcd_test_jobs").doc(jobDocId);

	// Get the count of existing distribution boards
	const distributionBoardsSnapshot = await jobDocRef
		.collection("distribution_boards")
		.get();
	const orderId = distributionBoardsSnapshot.size + 1; // Increment count for new orderId

	db.orderId = orderId; // Add orderId to the db object

	const { firebaseDocId, ...dbWithoutFirebaseDocId } = db;

	// Add the distribution board to the job document
	const docRef = await jobDocRef
		.collection("distribution_boards")
		.add(dbWithoutFirebaseDocId);

	// Retrieve the newly added distribution board document
	const boardData = (await docRef.get()).data();

	if (!boardData) {
		throw new HttpsError(
			"failed-precondition",
			"Failed to retrieve the newly added distribution board document."
		);
	}

	// add firebaseDocId to the boardData
	boardData.firebaseDocId = docRef.id;

	boardData.rcds = [];

	return boardData;
}
