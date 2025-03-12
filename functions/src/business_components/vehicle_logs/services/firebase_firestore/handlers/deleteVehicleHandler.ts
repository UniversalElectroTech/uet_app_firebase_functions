import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { isAdmin } from "../../../../../global/firebase_functions/isAdmin";
import { getFirestore } from "firebase-admin/firestore";
import { handleAxiosError } from "../../../../../global/services/helper_functions/errorHandling";

// Returns all customers with RCD testings jobs from the SimproAPI
export async function deleteVehicleHandler(request: CallableRequest) {
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

		const { vehicleDocId }: { vehicleDocId: string } = request.data;

		// Check if all required parameters have been received
		if (vehicleDocId === undefined) {
			throw new HttpsError(
				"failed-precondition",
				"Required parameters are missing."
			);
		}

		return await deleteVehicle(vehicleDocId);
	} catch (error: any) {
		return handleAxiosError(error);
	}
}

async function deleteVehicle(vehicleDocId: string) {
	await getFirestore()
		.collection("vehicles")
		.doc(vehicleDocId)
		.set({ deleted: true }, { merge: true });

	return;
}
