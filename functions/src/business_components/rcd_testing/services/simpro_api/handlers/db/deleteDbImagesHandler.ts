import { HttpsError } from "firebase-functions/v2/https";
import { CallableRequest } from "firebase-functions/v2/https";
import admin = require("firebase-admin");
import { handleAxiosError } from "../../../../../../global/services/helper_functions/errorHandling";
import { FieldValue } from "firebase-admin/firestore";

export async function deleteDbImagesHandler(request: CallableRequest) {
	// Check that the user is authenticated.
	if (!request.auth) {
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	try {
		const { jobDocId, dbDocId, imageUrls } = request.data;

		// Check if all required parameters have been received
		if (!jobDocId || !dbDocId || !Array.isArray(imageUrls)) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		// Remove each image URL from the 'images' array in Firestore
		const dbDocRef = admin
			.firestore()
			.collection("rcd_test_jobs")
			.doc(jobDocId)
			.collection("distribution_boards")
			.doc(dbDocId);

		await dbDocRef.update({
			images: FieldValue.arrayRemove(...imageUrls),
		});
	} catch (error) {
		return handleAxiosError(error);
	}
}

export async function deleteDbImages(imageUrls: string[]) {
	const storage = admin.storage();
	// Delete images from Firebase Storage
	const deletePromises = imageUrls.map(async (imageUrl) => {
		const decodedImageUrls = decodeURIComponent(imageUrl);
		const filePath = decodedImageUrls.split("/o/")[1].split("?")[0];

		// Delete the file from Firebase Storage
		try {
			await storage.bucket().file(filePath).delete();
		} catch (error) {
			// Continue to the next image URL
		}
	});

	await Promise.all(deletePromises);
}
