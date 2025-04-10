import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import * as admin from "firebase-admin";
import { handleAxiosError } from "../../../../../../global/services/helper_functions/errorHandling";
import { storage } from "firebase-admin";
import { getDownloadURL } from "firebase-admin/storage";

export async function addDbImagesHandler(request: CallableRequest) {
	// Check that the user is authenticated.
	if (!request.auth) {
		throw new HttpsError(
			"failed-precondition",
			"The function must be called while authenticated."
		);
	}

	try {
		const { jobDocId, dbDocId, images } = request.data;

		// Check if all required parameters have been received
		if (!jobDocId || !dbDocId || !Array.isArray(images)) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		const imageUrls = [];
		const bucket = storage().bucket();

		for (const imagePath of images) {
			// Assuming imagePath is Uint8List (byte array)
			const fileName = `rcd_testing/${jobDocId}/distribution_boards/${dbDocId}/images/${Date.now()}`;
			const file = bucket.file(fileName);

			// Save the image as a buffer
			const imageBuffer = Buffer.from(imagePath, "base64"); // Convert Base64 to Buffer

			await file.save(imageBuffer); // Save the image to the bucket

			const downloadURL = await getDownloadURL(file);
			imageUrls.push(downloadURL);
		}

		// Add image URLs to the distribution board document
		const dbDocRef = admin
			.firestore()
			.collection("rcd_test_jobs")
			.doc(jobDocId)
			.collection("distribution_boards")
			.doc(dbDocId);

		await dbDocRef.update({
			images: FieldValue.arrayUnion(...imageUrls),
		});

		return imageUrls; // Return the list of image URLs
	} catch (error) {
		return handleAxiosError(error);
	}
}
