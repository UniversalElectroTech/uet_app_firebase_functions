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

		// Retrieve existing RCDs to determine the next orderId
		const existingRcdsSnapshot = await rcdCollectionRef
			.orderBy("orderId", "desc")
			.limit(1)
			.get();
		let nextOrderId = 0; // Initialize nextOrderId

		if (!existingRcdsSnapshot.empty) {
			const lastRcd = existingRcdsSnapshot.docs[0].data(); // Get the last RCD
			nextOrderId = lastRcd.orderId + 1; // Set nextOrderId to last orderId + 1
		}

		const addedRcds: any[] = []; // To store added RCDs

		rcds.forEach((rcd) => {
			const rcdDocRef = rcdCollectionRef.doc(); // Create a new document reference
			const { firebaseDocId, ...rcdWithoutFirebaseDocId } = rcd; // Remove firebaseDocId from rcd
			nextOrderId++; // Set the next orderId
			batch.set(rcdDocRef, {
				...rcdWithoutFirebaseDocId,
				orderId: nextOrderId,
			}); // Use rcd without firebaseDocId and set orderId
			addedRcds.push({
				...rcd,
				firebaseDocId: rcdDocRef.id,
				orderId: nextOrderId,
			}); // Store the added RCD with its ID and orderId
		});

		await batch.commit();
		return { addedRcds }; // Return the added RCDs
	} catch (error) {
		return handleAxiosError(error);
	}
}
