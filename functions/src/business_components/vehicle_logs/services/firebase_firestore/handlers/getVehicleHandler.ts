import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";
import { isAdmin } from "../../../../../global/firebase_functions/isAdmin";

// Returns all customers with RCD testings jobs from the SimproAPI
export async function getVehicleHandler(request: CallableRequest) {
	try {
		// Check that the user is authenticated.
		if (!request.auth) {
			// Throwing an HttpsError so that the client gets the error details.
			throw new HttpsError(
				"failed-precondition",
				"The function must be " + "called while authenticated."
			);
		}

		if (!(await isAdmin(request.auth.uid))) {
			throw new HttpsError(
				"failed-precondition",
				"User is not authenticated for this action."
			);
		}

		const { vehicleFirebaseDocId }: { vehicleFirebaseDocId: string } =
			request.data; // Change to vehicleData

		// Check if all required parameters have been received
		if (!vehicleFirebaseDocId) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		return await getVehicle(vehicleFirebaseDocId);
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

async function getVehicle(vehicleFirebaseDocId: string) {
	const docSnap = await getFirestore()
		.collection("vehicles")
		.doc(vehicleFirebaseDocId)
		.get();

	const vehicleData = { ...docSnap.data(), docId: vehicleFirebaseDocId };

	if (!vehicleData) {
		throw new HttpsError("not-found", "Vehicle not found.");
	}

	return vehicleData;
}
