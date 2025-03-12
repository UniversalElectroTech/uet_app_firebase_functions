import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";

// Returns all customers with RCD testings jobs from the SimproAPI
export async function getAllVehiclesHandler(request: CallableRequest) {
	try {
		// Check that the user is authenticated.
		if (!request.auth) {
			// Throwing an HttpsError so that the client gets the error details.
			throw new HttpsError(
				"failed-precondition",
				"The function must be " + "called while authenticated."
			);
		}

		return await getAllVehicles();
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

async function getAllVehicles() {
	const docSnap = await getFirestore().collection("vehicles").get();

	return docSnap.docs
		.map((doc) => ({ docId: doc.id, ...doc.data() }))
		.filter(
			(vehicle: any) =>
				vehicle.deleted === undefined || vehicle.deleted === false
		);
}
