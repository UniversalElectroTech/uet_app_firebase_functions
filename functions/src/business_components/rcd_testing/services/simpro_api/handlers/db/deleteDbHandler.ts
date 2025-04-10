import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import admin = require("firebase-admin");
import { handleAxiosError } from "../../../../../../global/services/helper_functions/errorHandling";

export async function deleteDbHandler(request: CallableRequest) {
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

		// Query for the image URLs associated with the distribution board
		const docSnapshot = await dbDocRef.get();
		const images = docSnapshot.get("images") || [];

		// Delete each image from Firebase Storage
		const deletePromises = images.map((imageUrl: string) => {
			const imageRef = admin.storage().bucket().file(imageUrl);
			return imageRef.delete();
		});

		await Promise.all(deletePromises);
		// Delete the distribution board document
		await dbDocRef.delete();
		return { success: true };
	} catch (error) {
		return handleAxiosError(error);
	}
}
